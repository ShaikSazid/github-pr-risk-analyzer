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

- Frontend: ~~To be decided~~
- Backend: FastAPI
- ML Layer: Embedded in the backend

### API contract

Ultimately, what frontend sends as input and expects what output from the backend.

request body(JSON):
```
`JSON` 
{
"PR_URL": "..."
}
```

response body(JSON):
```
`JSON` 
{
"risk_score": 123,
"prediction": "...",
"suggestions": "..."
""
}
```

### Database Schema

No database scheme needed for backend. 
For ML ~~ To Be Decided ~~

### ML Specification  **#TODO**

- Model Architecture: 
- Input Shape:
- Output Shape:
- Pre trained weights: 
- metrics: 

- LLM deets:


### Dependencies

This project uses pdm to manage dependecies. You can use `pdm list` to check the packages.
A seperate requirements.txt file will be made after the completion of the project.