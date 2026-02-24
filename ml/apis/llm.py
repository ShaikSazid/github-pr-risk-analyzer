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
    if not code:
        return code

    code = re.sub(r"```[\w+-]*\n?", "", code)
    code = code.replace("```", "")

    if "\\n" in code:
        code = code.replace("\\n", "\n")
        code = code.replace("\\t", "\t")
        code = code.replace("\\r", "\r")

    if "\n" in code and code.count("\n") >= 3 and not any(len(line.strip()) > 120 for line in code.split('\n') if line.strip()):
        lines = [line.rstrip() for line in code.split('\n')]
        code = '\n'.join(lines)
        code = re.sub(r'\n\s*\n\s*\n', '\n\n', code)
        return code.strip()

    # UNIVERSAL FORMATTING FOR ALL LANGUAGES
    
    # 1. Handle annotations/decorators (Java @, Python @, C# [])
    code = re.sub(r'(@\w+(?:\([^)]*\))?)\s*([a-zA-Z])', r'\1\n\2', code)
    code = re.sub(r'(\[\w+(?:\([^)]*\))?\])\s*([a-zA-Z])', r'\1\n\2', code)
    
    # 2. Add newlines after semicolons (Java, C++, C#, JavaScript)
    code = re.sub(r';(?=\s*[a-zA-Z@\[])', ';\n', code)
    
    # 3. Handle function/method signatures
    code = re.sub(r'\)\s*{', ') {\n', code)
    code = re.sub(r':\s*{', ': {\n', code)  # JavaScript arrow functions
    
    # 4. Handle parameter lists - break long ones
    if '(' in code and ')' in code:
        # Find method signatures and break parameters
        code = re.sub(r',\s*(@\w+)', r',\n        \1', code)  # Annotated params
        code = re.sub(r',\s*([a-zA-Z_]\w*\s+[a-zA-Z_]\w*)', r',\n        \1', code)  # Typed params
        code = re.sub(r',\s*([a-zA-Z_]\w*\s*[=:])', r',\n        \1', code)  # Python/JS params
    
    # 5. Handle braces (Java, C++, C#, JavaScript, Go)
    code = re.sub(r'([a-zA-Z0-9_)]\s*){', r'\1 {\n', code)
    code = re.sub(r'}(?=\s*[a-zA-Z@])', '}\n', code)
    
    # 6. Handle Python colons
    code = re.sub(r':(?=\s*[a-zA-Z])', ':\n', code)
    
    # 7. Handle return statements
    code = re.sub(r'return\s+([a-zA-Z])', r'return \1', code)
    
    # 8. Clean up spacing
    code = re.sub(r' +', ' ', code)
    code = re.sub(r'\s*{\s*', ' {\n', code)
    code = re.sub(r'\s*}\s*', '\n}', code)
    
    # 9. UNIVERSAL INDENTATION
    lines = code.split('\n')
    formatted_lines = []
    indent_level = 0
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        # Annotations/decorators (Java @, Python @, C# [])
        if line.startswith(('@', '[')):
            formatted_lines.append('  ' * indent_level + line)
            continue
        
        # Closing braces/brackets
        if line.startswith(('}', ']', ')')):
            indent_level = max(0, indent_level - 1)
            formatted_lines.append('  ' * indent_level + line)
            continue
        
        # Method signatures (any language)
        if any(keyword in line for keyword in ['public ', 'private ', 'protected ', 'def ', 'function ', 'func ', 'class ', 'interface ']):
            formatted_lines.append('  ' * indent_level + line)
            if line.endswith(('{', ':')):
                indent_level += 1
            continue
        
        # Parameters (indented from method)
        if any(param in line for param in ['@RequestParam', '@PathVariable', '@RequestBody']) or \
           (any(type_keyword in line for type_keyword in ['int ', 'String ', 'boolean ', 'long ', 'double ', 'float ']) and '=' in line):
            formatted_lines.append('  ' * (indent_level + 1) + line)
            continue
        
        # Method closing with parameters
        if line in (')', ') {') or line.endswith(') {'):
            if not any(keyword in line for keyword in ['public ', 'private ', 'protected ']):
                indent_level = max(0, indent_level - 1)
            formatted_lines.append('  ' * indent_level + line)
            if line.endswith(('{', ':')):
                indent_level += 1
            continue
        
        # Return statements and method calls
        if line.startswith(('return ', 'throw ', 'yield ')):
            formatted_lines.append('  ' * (indent_level + 1) + line)
            continue
        
        # Default case
        formatted_lines.append('  ' * indent_level + line)
        
        # Increase indent after opening braces/colons
        if line.endswith(('{', ':')):
            indent_level += 1

    code = '\n'.join(formatted_lines)
    
    # Final cleanup
    code = re.sub(r'\n\s*\n', '\n', code)
    
    return code.strip()

def _validate_structure(result: Dict[str, Any], context: Dict) -> bool:
    """
    Only validate structure and file integrity.
    Do NOT reject for formatting issues.
    """

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
You are a strict senior software engineer reviewing a GitHub Pull Request.

Return strictly valid JSON only.
Follow the provided schema exactly.

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
          "language": string (required if code_example present)
        }}
      ]
    }}
  ]
}}

Rules:

1. Do NOT use markdown.
2. Do NOT wrap code in triple backticks.
3. Code must be properly formatted.
4. Each file must exactly match one of Files Changed.
5. Do not merge imports with other statements.
6. Numbered lists must use proper newline formatting.

Context:

Risk Score: {context.get("risk_score")}
Risk Label: {context.get("risk_label")}
Files Changed: {", ".join(context.get("file_names", []))}

Title:
{_truncate(context.get("title", ""), 1000)}

Body:
{_truncate(context.get("body", ""), 3000)}

Diff Summary:
{_truncate(context.get("diff_summary", ""), 4000)}
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
                break
            logger.warning(f"Client error: {e}")

        except Exception as e:
            logger.warning(f"Attempt {attempt} failed: {e}")

        if attempt < MAX_RETRIES:
            await asyncio.sleep(2 ** attempt)

    logger.error("LLM failed after retries")

    return {
    "risk_explanation": (
        "AI review is temporarily unavailable. "
        "Risk assessment is still provided, but detailed code analysis "
        "could not be generated at this time."
    ),
    "mitigation_steps": [
        "Please review the pull request manually.",
        "Try again later if AI analysis is required."
    ],
    "file_reviews": [],
    "source": "fallback"
}