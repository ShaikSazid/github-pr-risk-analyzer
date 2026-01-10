# Github Pull Request Reviewer

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

### input handling
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