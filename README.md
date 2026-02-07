# Github Pull Request Reviewer

## Product Requirement Document

### Problem

PR merges are traditionally "high-stakes" moments in the development lifecycle. No matter the level of preparation, unforeseen regressions and integration conflicts often disrupt the workflow.

### Solution 

Our tool leverages repository context and historical patterns to quantify the risk of any given PR. Using an LLM-driven analysis, it anticipates specific technical hurdles and provides developers with actionable resolutions before the "Merge" button is even clicked.

### User Flow

1. User inputs the PR url into the text box.
2. The system will fetch the data.
3. System will evaluate the risk score and use LLM to generate the steps to mitigate it.
4. User will follow the advise to mitigate the risks.

**Note** The website will not manage, edit or tamper with the github code in any form. The user must manually make changes, whatever it may be.

## The Data Flow **#TODO**

### Input
### Transformation
### Inference
### Output

## Techinal Specification

### Sytem Architectural Design

- Frontend: React
- Backend: FastAPI
- ML Layer: Embedded in the backend

### API contract

Ultimately, what frontend sends as input and expects what output from the backend.

request body(`JSON`):
```
{
"PR_URL": "..."
}
```

response body(`JSON`): 
```
{
"risk_score": 123,
"prediction": "...",
"suggestions": "..."
""
}
```

### Database Schema 
refer to schemas folder for database schema.
No database scheme needed for backend.  
For ML

## Machine Learning

## ML Model

Model to predict the score factor of merging PRs.

- Model: Random Forest Classifier
- Training Label(Y): Is_risky: if (hours_to_merge > 70) | (review_comments_count >= 3) | (issue_comments_count >= 5)
- ML Input(X): PR Metadata. 
- ML Output: Risk_score(0-10), top_5_contributing_factors

`Heuristic baseline: is there an existing system? Yes, but only available in Tech Companys as internal tools. Didn't find any tools on the internet`

Input: Features from the PR using github API  
Output: Risk_score and top_risk_factors

## LLM

Repo context fed to LLM.
- The Diff - Actual lines changed.
- related files - If user.js, fetch names of files which imports or uses user.js.
- recent commit messages - fetch last 5 commit messages for modified files.
- contrubution/contributing.md - if the repo has any standards, let the LLM know.

- LLM Input: ML risk factors, score, code diff, related file names, 3 or 5 commit messages.
- LLM Output:
    1) Explanation of risk
    2) Mitigation Strategy
    3) refactored code snippet (If necessary)

### Dependencies

This project uses pdm to manage dependecies. You can use `pdm list` to check the packages.
A seperate requirements.txt file will be made after the completion of the project.