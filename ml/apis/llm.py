import os
import google.generativeai as genai
import json

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_review(risk_output: dict, pr_context: dict) -> str:
  """
  risk_output: { 'risk_score', 'risk_label', 'top_risk_factors' }
  pr_context: { 'title', 'body', 'diff_summary', 'file_names', 'commit_messages', 'contributing_md' }
  """
  prompt = f"""You are a senior software engineer reviewing a GitHub Pull Request.
  Based on the risk assessment and PR context below, provide a concise review in VALID JSON format only.

  ## Risk Assessment
  - Risk Score: {risk_output['risk_score']}/10 ({risk_output['risk_label']})
  - Top Risk Factors: {', '.join(risk_output['top_risk_factors'])}

  ## PR Context
  - Title: {pr_context.get('title', 'N/A')}
  - Body: {pr_context.get('body', 'N/A')[:500]}...
  - Files Changed: {', '.join(pr_context.get('file_names', [])[:20])}
  - Diff Summary: {pr_context.get('diff_summary', 'N/A')[:1000]}...
  - Recent Commits: {chr(10).join(pr_context.get('commit_messages', [])[:5])}
  - Contributing Guidelines: {pr_context.get('contributing_md', 'None available')[:500]}...

  ## Response Format (JSON only):
  {{
  "risk_explanation": "Why is this PR risky (or safe)? (2-3 sentences)",
  "mitigation_steps": ["Step 1", "Step 2", "Step 3"],
  "code_suggestions": ["Suggestion 1 if applicable", "Suggestion 2 if applicable"]
  }}"""

  try:
      model = genai.GenerativeModel("gemini-1.5-flash")
      response = model.generate_content(prompt)
      return response.text.strip()  # Returns the JSON string
  except Exception as e:
      return json.dumps(f"Error generating review: {str(e)}")