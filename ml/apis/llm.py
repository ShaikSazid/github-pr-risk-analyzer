# ml/apis/llm.py

import logging
import time
from typing import Dict

from google import genai
from google.genai.errors import ClientError
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

MODEL_NAME = "models/gemini-2.5-flash"
MAX_RETRIES = 3

client = genai.Client(api_key=settings.GEMINI_API_KEY)


def _fallback(risk_output: Dict) -> Dict:
    return {
        "risk_explanation": (
            f"This PR is classified as "
            f"{risk_output.get('risk_label', 'UNKNOWN').lower()} "
            f"risk (score: {risk_output.get('risk_score', 0)}/10). "
            f"Manual review recommended."
        ),
        "mitigation_steps": [
            "Perform detailed code review",
            "Run full test suite",
            "Check for breaking changes",
            "Validate security implications"
        ],
        "code_suggestions": [],
        "dependencies": [],
        "source": "fallback"
    }


def generate_review(risk_output: Dict, pr_context: Dict) -> Dict:

    prompt = f"""
You are a senior software engineer reviewing a GitHub Pull Request.

Risk Score: {risk_output['risk_score']}/10
Risk Label: {risk_output['risk_label']}
Top Risk Factors: {", ".join(risk_output.get("top_risk_factors", []))}

Title: {pr_context.get("title", "")}
Body: {pr_context.get("body", "")}
Files Changed: {", ".join(pr_context.get("file_names", []))}
Diff Summary: {pr_context.get("diff_summary", "")}
Recent Commits:
{chr(10).join(pr_context.get("commit_messages", []))}
"""

    schema = {
        "type": "object",
        "properties": {
            "risk_explanation": {"type": "string"},
            "mitigation_steps": {
                "type": "array",
                "items": {"type": "string"}
            },
            "code_suggestions": {
                "type": "array",
                "items": {"type": "string"},
            },
            "dependencies": {
                "type": "array",
                "items": {"type": "string"}
            }
        },
        "required": [
            "risk_explanation",
            "mitigation_steps",
            "code_suggestions",
            "dependencies"
        ]
    }

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            logger.info(f"Calling Gemini LLM (attempt {attempt})")

            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=prompt,
                config={
                    "temperature": 0.2,
                    "response_mime_type": "application/json",
                    "response_schema": schema,
                }
            )

            if not response.parsed:
                raise ValueError("Structured response parsing failed")

            result = dict(response.parsed)
            result["source"] = "llm"

            logger.info("LLM structured response received")
            return result

        except ClientError as e:
            if "429" in str(e):
                logger.error("Quota exceeded")
                break
            logger.warning(f"Client error: {e}")

        except Exception as e:
            logger.warning(f"Attempt {attempt} failed: {e}")

        if attempt < MAX_RETRIES:
            sleep_time = 2 ** attempt
            logger.info(f"Retrying in {sleep_time}s...")
            time.sleep(sleep_time)

    logger.error("LLM failed after retries — returning fallback")
    return _fallback(risk_output)
