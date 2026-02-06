# Backend ↔ ML ↔ LLM Schemas

This document defines the request and response contracts between the Backend,
Machine Learning (ML) service, and Large Language Model (LLM) service for the
GitHub Pull Request Reviewer project.

The backend acts purely as an orchestrator and does not interpret ML or LLM outputs.

----------------------------------------------------------------

1. Backend API

Endpoint
POST /api/v1/analyze/pr

Request Body (Frontend → Backend)

{
  "pr_url": "https://github.com/{owner}/{repo}/pull/{number}"
}

Response Body (Backend → Frontend)

{
  "risk_label": "LOW" | "MEDIUM" | "HIGH",
  "risk_score": number,
  "review_comments": string
}

----------------------------------------------------------------

2. ML Service Contract

ML Request (Backend → ML)

The backend sends normalized numeric metadata only.

{
  "files_changed": number,
  "lines_added": number,
  "lines_deleted": number,
  "files_extensions": string[],
  "title_length": number,
  "description_length": number
}

Notes
- All fields are derived from GitHub PR metadata
- No raw code, diffs, or text are sent to ML
- Backend does not interpret ML output

ML Response (ML → Backend)

{
  "risk_score": number,
  "risk_label": "LOW" | "MEDIUM" | "HIGH"
}

Constraints
- risk_score must be a float between 0.0 and 1.0
- Backend treats ML output as opaque

----------------------------------------------------------------

3. LLM Service Contract

LLM Request (Backend → LLM)

The backend provides repository context along with ML output.

{
  "risk_score": number,
  "risk_label": "LOW" | "MEDIUM" | "HIGH",

  "pr_summary": string,

  "diff_summary": {
    "files_changed": number,
    "lines_added": number,
    "lines_deleted": number
  },

  "diff_text": string,

  "recent_commits": string[],

  "contributing_guidelines": string | null
}

Notes
- pr_summary is derived from the PR title
- diff_text may be truncated to enforce size limits
- recent_commits contains the latest 3–5 commit messages
- contributing_guidelines is null if not present
- LLM does not fetch GitHub data directly

LLM Response (LLM → Backend)

{
  "review_comments": string
}

----------------------------------------------------------------

4. Error Handling

Invalid PR URL            → 500
GitHub API failure        → 502
ML service failure        → 500
LLM service failure       → 500

----------------------------------------------------------------

5. Design Principles

- Backend is stateless
- ML is stateless
- LLM is stateless
- Backend owns the API contract
- Services integrate strictly via schemas
- No database is required

----------------------------------------------------------------

6. Contract Ownership

This schema is owned by the backend service.
Any changes must be discussed and agreed upon before implementation.
