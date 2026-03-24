A project which reads on historical data to determine whether a PR is risky or not and further suggestions to improve it if risky

## Backend Objective

It acts as a orchestrator between the frontend and ML

On a macro level:
- it receives input
- fetches data
- calls ML
- calls LLM
- returns results

**things to note**
Backend must
- validate input
- handle github/API failures cleanly
- normalize data before sending to ML
- ML and LLM are stateless functions so keep it in mind

## System Architecture (High-level Overview)
1) Recieve pull request from frontend
2) Extract metadata using github API
3) Pass the data to ML model
4) Pass ML output + repo context to LLM
5) Send risk score + AI suggestions to frontend

## functions of backend

input handling
PR data:
- PR url must contain owner, repo and PR number
- reject if not valid

Fetch data from Github API (token stored in .env)
- PR title
- PR description/body
- Number of files changed
- Lines added
- Lines deleted
- File names
- Diff summary (text)

Normalize data: before sending to ML
- example
```
{
  "title": "...",
  "description_length": 340,
  "files_changed": 5,
  "lines_added": 120,
  "lines_deleted": 40,
  ...
}
```
ML model response:
- ML model already exists (I'll create it)

```
{
  "risk_score": 7.2,
  "risk_label": "HIGH"
}
```

your job:
- Pass metadata exactly as required
- Capture output
- Do not interpret results

LLM request:
Generate risk suggestions using 
- repo context
- PR summary 
- ML response

input to LLM
```
{
  "risk_label": "HIGH",
  "risk_score":  7.2,
  "pr_summary": "...",
  "diff_summary": "..."
}
```
Output from LLM
```
{
  "review_comments": "This PR introduces risky changes..."
}

```

Final response to frontend
format:
```
{
  "risk_label": "HIGH",
  "risk_score": 7.2,
  "review_comments": "..."
}
```

Need to desin how to show this in frontend

### Error handling
- invalid URL              - 500
- API failure              - 502
- ML model request failure - 500
- LLM failure              - 500


### Data Flow

Frontend
  ↓
/analyze-pr (PR URL)
  ↓
GitHub API → normalize metadata
  ↓
/ml/predict
  ↓
/llm/generate-review
  ↓
Frontend

#TODO: Design request and respose schemas