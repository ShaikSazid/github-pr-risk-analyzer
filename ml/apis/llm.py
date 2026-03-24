import logging
import asyncio
import re
from typing import Dict, Any, List

from google import genai
from google.genai.errors import ClientError
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

MODEL_NAME = "models/gemini-2.5-flash"
MAX_RETRIES = 3
MAX_PROMPT_CHARS = 12000

client = genai.Client(api_key=settings.GEMINI_API_KEY)

SCHEMA = {
    "type": "object",
    "properties": {
        "risk_explanation": {"type": "string"},
        "mitigation_steps": {
            "type": "array",
            "items": {"type": "string"},
        },
        "file_reviews": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "file": {"type": "string"},
                    "issues": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "description": {"type": "string"},
                                "code_example": {"type": "string"},
                                "language": {"type": "string"},
                            },
                            "required": ["description"],
                        },
                    },
                },
                "required": ["file", "issues"],
            },
        },
    },
    "required": ["risk_explanation", "mitigation_steps", "file_reviews"],
}


def _truncate(text: str, limit: int = 4000) -> str:
    if not text:
        return ""
    return text[:limit]


def _sanitize_code(code: str) -> str:
    """
    Clean and normalize code examples returned by the LLM.
    Handles escaped newlines, markdown fences, and collapsed single-line code.
    """
    if not code:
        return code

    # Step 1: Strip markdown code fences
    code = re.sub(r"```[\w+\-#]*\n?", "", code)
    code = code.replace("```", "")

    # Step 2: Convert escaped sequences to real characters
    code = code.replace("\\n", "\n")
    code = code.replace("\\t", "\t")
    code = code.replace("\\r", "\r")
    code = code.replace('\\"', '"')
    code = code.replace("\\'", "'")

    # Step 3: If already properly multi-line, just clean trailing whitespace and return
    lines = code.split("\n")
    if len(lines) >= 2 and any(line.strip() for line in lines):
        cleaned = [line.rstrip() for line in lines]
        # Remove leading/trailing blank lines
        while cleaned and not cleaned[0].strip():
            cleaned.pop(0)
        while cleaned and not cleaned[-1].strip():
            cleaned.pop()
        return "\n".join(cleaned)

    # Step 4: Code is collapsed into a single line — attempt to expand it
    single = code.strip()

    # Insert newlines after semicolons (JS, Java, C++, C#, Go, etc.)
    single = re.sub(r";(?=\s*(?:[a-zA-Z@\[{\"'`]|$))", ";\n", single)

    # Insert newlines before/after braces
    single = re.sub(r"\{(?!\n)", "{\n", single)
    single = re.sub(r"(?<!\n)\}", "\n}", single)

    # Insert newlines after colons that start blocks (Python)
    single = re.sub(r":(?=\s*(?:def |class |if |for |while |return |[a-zA-Z_]))", ":\n    ", single)

    # Insert newlines after common statement keywords
    single = re.sub(r"(return\s+[^;{\n]+);", r"\1;\n", single)
    single = re.sub(r"(import\s+[^;\n]+);", r"\1;\n", single)

    # Split and re-indent naively
    raw_lines = single.split("\n")
    indent = 0
    result = []

    for raw_line in raw_lines:
        line = raw_line.strip()
        if not line:
            continue

        # Decrease indent for closing braces/brackets
        if line.startswith(("}",")","]")):
            indent = max(0, indent - 1)

        result.append("    " * indent + line)

        # Increase indent after opening braces/colon
        if line.endswith(("{", ":", "(")):
            indent += 1
        # Reset if brace opens and closes on same line
        if line.count("{") > 0 and line.count("{") == line.count("}"):
            pass

    code = "\n".join(result)

    # Final cleanup: collapse 3+ blank lines into 1
    code = re.sub(r"\n{3,}", "\n\n", code)

    return code.strip()


def _validate_structure(result: Dict[str, Any], context: Dict) -> bool:
    files = context.get("file_names", [])
    file_reviews = result.get("file_reviews")

    if not isinstance(file_reviews, list):
        return False

    for review in file_reviews:
        if review.get("file") not in files:
            return False
        issues = review.get("issues")
        if not isinstance(issues, list):
            return False
        for issue in issues:
            if not issue.get("description"):
                return False

    return True


def _build_prompt(context: Dict) -> str:
    prompt = f"""
You are a strict senior software engineer performing a security review of a GitHub Pull Request.

Return strictly valid JSON only. Follow the provided schema exactly.

Schema:

{{
  "risk_explanation": string,
  "mitigation_steps": string[],
  "file_reviews": [
    {{
      "file": string,
      "issues": [
        {{
          "description": string,
          "code_example": string (optional),
          "language": string (required if code_example is present)
        }}
      ]
    }}
  ]
}}

CRITICAL RULES FOR CODE EXAMPLES:

1. Do NOT use markdown — no triple backticks, no fences.
2. The "language" field MUST be the actual language/framework of the file:
   - .py → "python"
   - .js / .jsx → "javascript"
   - .ts / .tsx → "typescript"
   - .vue → "vue"
   - .html → "html"
   - .css / .scss → "css"
   - .go → "go"
   - .java → "java"
   - .kt → "kotlin"
   - .swift → "swift"
   - .rb → "ruby"
   - .php → "php"
   - .rs → "rust"
   - .cpp / .cc → "cpp"
   - .c → "c"
   - .sql → "sql"
   - .sh / .bash → "bash"
   - .yaml / .yml → "yaml"
   - .json → "json"
   Never use "text" or "code" as the language.
3. Code in "code_example" MUST use real newline characters (\\n), NOT literal backslash-n.
   Each statement must be on its own line — never collapse multiple statements onto one line.
4. Preserve original indentation. Use 2 or 4 spaces consistently.
5. Each file must exactly match one of the Files Changed listed below.
6. Do not merge import statements with other code.

Context:

Risk Score: {context.get("risk_score")}
Risk Label: {context.get("risk_label")}
Files Changed: {", ".join(context.get("file_names", []))}

Title:
{_truncate(context.get("title", ""), 1000)}

Body:
{_truncate(context.get("body", ""), 3000)}

Diff:
{_truncate(context.get("selected_patch", ""), 4000)}
"""

    if len(prompt) > MAX_PROMPT_CHARS:
        prompt = prompt[:MAX_PROMPT_CHARS]

    return prompt


async def generate_review(context: Dict) -> Dict[str, Any]:
    prompt = _build_prompt(context)

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info(f"Calling Gemini LLM (attempt {attempt})")

            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config={
                    "temperature": 0.2,
                    "response_mime_type": "application/json",
                    "response_schema": SCHEMA,
                },
            )

            if not response.parsed:
                raise ValueError("Structured parsing failed")

            result = dict(response.parsed)
            result["source"] = "llm"


            for file_review in result.get("file_reviews", []):
                for issue in file_review.get("issues", []):
                    if issue.get("code_example"):
                        issue["code_example"] = _sanitize_code(issue["code_example"])

            
            if not _validate_structure(result, context):
                raise ValueError("Structure validation failed")

            logger.info("LLM validated successfully")
            return result

        except ClientError as e:
            if "429" in str(e):
                logger.error("Quota exceeded")
                raise
            logger.warning(f"Client error: {e}")

        except Exception as e:
            logger.warning(f"Attempt {attempt} failed: {e}")

        if attempt < MAX_RETRIES:
            await asyncio.sleep(2 ** attempt)

    logger.error("LLM failed after retries")

    return {
        "risk_explanation": "LLM validation failed. Manual review recommended.",
        "mitigation_steps": ["Perform manual review."],
        "file_reviews": [],
        "source": "fallback"
    }