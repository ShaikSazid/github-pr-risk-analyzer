# Project Report: GitHub Pull Request Reviewer

## Introduction
This project introduces a GitHub Pull Request Reviewer, an intelligent system designed to assess the risk associated with pull requests and provide constructive suggestions for improvement. By leveraging historical data and advanced analytical models, the system aims to streamline the code review process and enhance code quality.

## Problem Statement
The manual review of GitHub pull requests can be a time-consuming and error-prone process, often leading to inconsistent risk assessments and missed opportunities for improvement. Developers need a tool that can quickly identify potential risks in PRs and offer actionable insights to mitigate them, thereby improving code quality and development efficiency.

## Objective
The primary objective of the backend system is to act as an orchestrator between the frontend interface and the Machine Learning (ML) and Large Language Model (LLM) components. On a macro level, the backend is responsible for:
- Receiving input pull request data.
- Fetching relevant data from the GitHub API.
- Calling the ML model for risk assessment.
- Calling the LLM for generating review suggestions.
- Returning the comprehensive results to the frontend.

Key considerations for the backend include:
- Validating input to ensure data integrity.
- Handling GitHub API failures gracefully.
- Normalizing data before it is sent to the ML model.
- Ensuring that ML and LLM interactions are stateless.

## Literature Review
(To be filled)

## Methodology
The system's methodology involves a structured data flow to analyze pull requests:
1. **Input Reception**: The system receives a pull request URL from the frontend.
2. **Data Extraction**: Metadata is extracted from the provided pull request using the GitHub API. This includes PR title, description/body, number of files changed, lines added, lines deleted, file names, and a diff summary.
3. **Data Normalization**: The extracted data is then normalized into a structured format suitable for the ML model, exemplified by fields such as `title`, `description_length`, `files_changed`, `lines_added`, `lines_deleted`, etc.
4. **ML Model Prediction**: The normalized data is passed to an existing ML model, which predicts a `risk_score` and `risk_label` (e.g., "HIGH", "MEDIUM", "LOW").
5. **LLM Review Generation**: The ML output, along with relevant repository context and PR summary, is fed into an LLM. The LLM generates `review_comments` based on this input.
6. **Result Delivery**: The final response, comprising the `risk_label`, `risk_score`, and `review_comments`, is sent back to the frontend.

Error handling is implemented for various stages, including invalid URLs, API failures, ML model request failures, and LLM failures.

## System Architecture
The system architecture follows a clear flow:
1. **Frontend**: Initiates the process by sending a pull request URL.
2. **Backend `/analyze-pr` endpoint**: Receives the PR URL.
3. **GitHub API Interaction**: The backend fetches and normalizes pull request metadata.
4. **ML Model (`/ml/predict`)**: Processes normalized data to determine risk.
5. **LLM (`/llm/generate-review`)**: Generates review comments based on ML output and PR context.
6. **Frontend**: Receives the final risk assessment and review suggestions.

## Technology Stack
- **Backend**: Python
- **Frontend**: (To be filled)

## Implementation and Present Results
The implementation will focus on creating robust API endpoints and services within the backend to manage the flow of data between the frontend, GitHub API, ML model, and LLM.

**ML Model Response Format:**
```/dev/null/example.json#L1-4
{
  "risk_score": 0.72,
  "risk_label": "HIGH"
}
```

**LLM Request Input Format:**
```/dev/null/example.json#L1-5
{
  "risk_label": "HIGH",
  "risk_score": 0.72,
  "pr_summary": "...",
  "diff_summary": "..."
}
```

**LLM Response Output Format:**
```/dev/null/example.json#L1-3
{
  "review_comments": "This PR introduces risky changes..."
}
```

**Final Response to Frontend Format:**
```/dev/null/example.json#L1-4
{
  "risk_label": "HIGH",
  "risk_score": 0.72,
  "review_comments": "..."
}
```

## Future Work
(To be filled)

## References
(To be filled)
