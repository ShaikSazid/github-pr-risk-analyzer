# Project Report: GitHub Pull Request Reviewer

## Introduction
This project introduces a GitHub Pull Request Reviewer, an intelligent system designed to assess the risk associated with pull requests and provide constructive suggestions for improvement. By leveraging historical data and advanced analytical model, the system aims to streamline the code review process and enhance code quality.

## Problem Statement
The manual review of GitHub pull requests can be a time-consuming and error-prone process, often leading to inconsistent risk assessments and missed opportunities for improvement. Developers need a tool that can quickly identify potential risks in PRs and offer actionable insights to mitigate them, thereby improving code quality and development efficiency.

## Objective
The primary objective of this project is to develop an Automated GitHub Pull Request Review and Risk Analysis System that transcends the limitations of traditional rule-based code review tools. Unlike manual or static analysis methods, this system aims to leverage historical repository data to predict risk, prioritize reviews, and generate intelligent feedback using learned patterns.  
- **Data-Driven Risk Prediction**: Train machine learning models on historical pull request data—including defects and review comments—to predict risk levels and assign probabilistic scores to code changes.
- **Intelligent Prioritization**: Enable development teams to prioritize code reviews based on data-driven risk assessments rather than chronological order, ensuring critical changes receive immediate attention.
- **Explainable AI Feedback**: Utilize Large Language Models (LLMs), conditioned on repository context, to generate explainable review suggestions that are aligned with the predicted risks.
- **Holistic Quality Improvement**: Deliver a comprehensive platform that surfaces insights via dashboards or GitHub integrations, ultimately improving software quality and code review efficiency.

## Literature Review
The transition from manual code review to automated, intelligent assistance has been a focal point of recent software engineering research. This project builds upon established studies in three key areas: risk prediction using historical data, semantic feature engineering via Abstract Syntax Trees (AST), and the application of Large Language Models (LLMs) for explainable feedback.  
- **Machine Learning for Risk Prediction**
    Traditional code review often relies on static analysis, which lacks the context of historical development patterns. Research into "Just-in-Time" (JIT) defect prediction has demonstrated that machine learning models can effectively predict the likelihood of a pull request introducing a bug by analyzing past data.  
    - **Historical Data Utilization**: Significant work, such as the DeepPull approach, utilizes deep learning to predict pull request outcomes (e.g., whether a PR will be rejected or require extensive rework) by leveraging both tabular and textual data from the repository's history.
    - **Industrial Application**: Similar methodologies have been adopted in industry; for instance, Meta’s Diff Risk Score (DRS) uses a model trained on historical code changes to predict the probability of a production incident, allowing teams to "unfreeze" code merges during sensitive periods by identifying low-risk changes. This project adopts a similar data-driven approach to assign probabilistic risk scores to incoming PRs.
- **Feature Engineering with AST and Code Diffs**
    To improve prediction accuracy beyond simple metrics (like lines of code), recent literature emphasizes the need for deep semantic analysis.
    - **Semantic Features**: Researchers have found that traditional metrics often fail to capture the "meaning" of a code change. Approaches that extract semantic information from Abstract Syntax Tree (AST) token sequences have been shown to significantly improve defect prediction accuracy.
    - **AST N-grams**: Studies utilizing AST n-grams have demonstrated that specific structural patterns in the code are strong indicators of potential faults, sometimes making a method up to three times more likely to contain a defect.
    - **Hybrid Models**: The most effective modern systems often use a hybrid approach, fusing semantic features (from ASTs) with traditional process metrics (like developer experience and file history) to train classifiers, a strategy mirrored in this project's architecture.
- **LLMs for Automated Review and Explainability**
    While ML models excel at prediction, they often lack explainability. The integration of LLMs addresses this gap by generating human-readable context.
    - **Contextual Summarization**: Recent studies indicate that LLMs conditioned on repository context (e.g., combining code diffs with custom rule sets) can generate highly relevant code summaries and review comments, outperforming standard metadata-based previews.
    - **Explainable AI (XAI)**: LLMs serve a critical role in "Explainable AI" by translating complex risk scores into narrative explanations, bridging the gap between a model's numerical output and a developer's understanding.
    - **Prioritization**: Beyond simple bug detection, LLM-based tools like code2Prompt have successfully demonstrated the ability to prioritize critical code segments for review based on complexity and data sensitivity, effectively guiding human reviewers to the most high-risk areas of a pull request.

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
- **Frontend**: Reactjs
- **External APIs**: Github API, Gemini API

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
1. **User Feedback Loop**: Implementing a mechanism for developers to rate the helpfulness of the review comments to fine-tune the LLM.  
2. **Support for Multiple Languages**: Expanding the ML model to accurately assess risk across different programming languages.
3. **Caching**: Implementing caching for GitHub API responses to reduce latency and API usage limits.

## References
1. H. Mohammadkhani, "Explainable AI for Software Engineering: A Systematic Review and an Empirical Study," Master's thesis, University of Calgary, 2023. [Online](https://prism.ucalgary.ca)  
2. P. Banyongrakkul and S. Phoomvuthisarn, "DeepPull: Deep Learning-Based Approach for Predicting Reopening, Decision, and Lifetime of Pull Requests on GitHub Open-Source Projects," in Communications in Computer and Information Science, Springer, 2024.  
3. Meta Engineering, "Diff Risk Score: AI-driven risk-aware software development," Engineering at Meta, Aug. 06, 2025. [Online](https://engineering.fb.com)
4. P. Singkorapoom and S. Phoomvuthisarn, "Just-in-Time Software Defect Prediction Techniques: A Survey," in 2024 15th International Conference on Information and Communication Systems (ICICS), IEEE, 2024.  
5. G. Kinde, "Explainable LLMs in Code Reviews: Tactics for Trustworthy Assistance," Kinde Engineering Blog, 2025.
