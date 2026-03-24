# GitHub PR Risk Analyzer

> An AI-assisted pull request triage system that predicts PR risk from GitHub metadata and generates a structured security-focused review for faster, more consistent inspection.

---

## Abstract

GitHub PR Risk Analyzer is a hybrid ML + LLM system for early pull request triage. Given a GitHub PR URL, it fetches PR metadata and file diffs, derives 22 engineered repository-level and change-level features, predicts a risk score using a Random Forest classifier, and then conditionally sends a trimmed diff to Google Gemini for structured security review generation. The goal is not to replace human review, but to help teams prioritize high-risk pull requests, reduce reviewer fatigue, and surface likely security concerns earlier in the review lifecycle.

## Project Summary

Objectives: consistent, fast PR risk scoring + actionable review output (summary, mitigations, per-file issues).
Architecture: React frontend → FastAPI backend → GitHub fetch + ML inference + Gemini review → single JSON response.
Future: caching, repo/org policy thresholds, and expanded training data/features.

## Literature Review

This project sits at the intersection of pull request outcome prediction, just-in-time defect prediction, and LLM-assisted secure code review. The following papers are relevant to the design direction of this system.

### 1. E-PRedictor: Early prediction of PR acceptance

- **Title**: *E-PRedictor: An Approach for Early Prediction of Pull Request Acceptance*
- **Authors**: Kexing Chen, Lingfeng Bao, Xing Hu, Xin Xia, Xiaohu Yang
- **Year / Venue**: 2025, *Science China Information Sciences* 68(5)
- **Relevance to this project**: Shows that useful early PR signals can be extracted at submission time from metadata and text features. This supports the design choice in this project to compute risk from GitHub metadata before any deep semantic review step.
- **What we adopted**: The idea of early-stage PR assessment from repository metadata.
- **What we did not adopt**: Acceptance prediction, SMOTE, variational autoencoders, or a text-heavy acceptance objective.

### 2. Multi-output learning for PR evaluation and reopening

- **Title**: *Multi-Output Learning for Predicting Evaluation and Reopening of GitHub Pull Requests on Open-Source Projects*
- **Authors**: Peerachai Banyongrakkul, Suronapee Phoomvuthisarn
- **Year / Venue**: 2023, ICSOFT
- **Relevance to this project**: Demonstrates that PR assessment can be framed as a richer prediction problem using both metadata and textual information.
- **What we adopted**: The broader view that PR triage benefits from combining multiple signal types rather than relying only on raw code diff size.
- **What we did not adopt**: Multi-output prediction, deep shared representations, textual embeddings, or reopening/latency targets.

### 3. Human-in-the-loop online JIT defect prediction

- **Title**: *Human-in-the-loop Online Just-In-Time Software Defect Prediction*
- **Authors**: Xutong Liu, Yufei Zhou, Yutian Tang, Junyan Qian, Yuming Zhou
- **Year / Venue**: 2023, arXiv preprint; later published in software engineering venues
- **Relevance to this project**: Highlights the value of reviewer feedback in continuously improving risk prediction quality.
- **What we adopted**: Conceptually, this motivates future feedback loops between reviewer decisions and model updates.
- **What we did not adopt**: Online learning, prequential evaluation, or human feedback integration in the current implementation.

### 4. Cross-project online JIT defect prediction

- **Title**: *Cross-Project Online Just-In-Time Software Defect Prediction*
- **Authors**: Sadia Tabassum, Leandro L. Minku, Danyi Feng
- **Year / Venue**: 2022, IEEE Transactions on Software Engineering
- **Relevance to this project**: Supports the use of data collected from many repositories rather than a single project when learning general defect-risk behavior.
- **What we adopted**: Cross-project data collection from a broad set of GitHub repositories.
- **What we did not adopt**: Online adaptation strategies or cross-project online ensemble methods.

### 5. DRS-OSS: LLM-driven diff risk scoring for PRs

- **Title**: *DRS-OSS: LLM-Driven Diff Risk Scoring Tool for PR Risk Prediction*
- **Authors**: Ali Sayedsalehi, Peter C. Rigby, Audris Mockus
- **Year / Venue**: 2025, arXiv preprint
- **Relevance to this project**: Very close in spirit, as it treats diffs as first-class risk signals and studies selective inspection of risky changes.
- **What we adopted**: The intuition that not all changes deserve equal inspection budget, reflected here through risk-aware diff selection before LLM review.
- **What we did not adopt**: A fine-tuned long-context sequence classifier over full diffs.

### 6. An Insight into Security Code Review with LLMs

- **Title**: *An Insight into Security Code Review with LLMs: Capabilities, Obstacles, and Influential Factors*
- **Authors**: Jiaxin Yu, Peng Liang, Yujia Fu, Amjed Tahir, Mojtaba Shahin, Chong Wang, Yangxiao Cai
- **Year / Venue**: 2024, arXiv preprint
- **Relevance to this project**: Directly informs the decision to use an LLM for security-focused review generation while remaining cautious about verbosity and inconsistency.
- **What we adopted**: Structured output expectations and selective prompt payload design to reduce noisy review output.
- **What we did not adopt**: A benchmark-style comparative evaluation against static analyzers in this repository.

### 7. SecureReviewer: Fine-tuning LLMs for secure code review

- **Title**: *SecureReviewer: Enhancing Large Language Models for Secure Code Review through Secure-Aware Fine-Tuning*
- **Authors**: Fang Liu, Simiao Liu, Yinghao Zhu, and co-authors
- **Year / Venue**: 2025, arXiv preprint; accepted for ICSE 2026 research track
- **Relevance to this project**: Reinforces the importance of review comments that not only identify risks but also recommend mitigations.
- **What we adopted**: The emphasis on actionable review output with fixes and mitigations, not just issue flags.
- **What we did not adopt**: Secure-aware fine-tuning, RAG, or SecureBLEU-style evaluation.

### 8. iCodeReviewer: Mixture-of-prompts secure code review

- **Title**: *iCodeReviewer: Improving Secure Code Review with Mixture of Prompts*
- **Authors**: Yun Peng, Kisub Kim, Linghan Meng, Kui Liu
- **Year / Venue**: 2025, arXiv preprint; ASE 2025 Industry Showcase
- **Relevance to this project**: Suggests that prompt specialization can improve review quality and reduce hallucinations.
- **What we adopted**: Indirectly, the current project uses structured prompting and selective diff exposure instead of a one-size-fits-all freeform review prompt.
- **What we did not adopt**: Mixture-of-prompts routing or prompt experts.

### 9. BitsAI-CR: Industrial LLM-based code review

- **Title**: *BitsAI-CR: Automated Code Review via LLM in Practice*
- **Authors**: Tao Sun, Jian Xu, Yuanpeng Li, Zhao Yan, Ge Zhang, Lintao Xie, Lu Geng, Zheng Wang, Yueyan Chen, Qin Lin, Wenbo Duan, Kaixin Sui
- **Year / Venue**: 2025, arXiv preprint; FSE 2025 Industry Track
- **Relevance to this project**: Demonstrates the practical need for constrained review generation and filtering of low-value comments in production settings.
- **What we adopted**: The idea that review output should be structured and reviewer-friendly rather than raw model prose.
- **What we did not adopt**: A two-stage LLM pipeline, a 200+ rule taxonomy, or industrial-scale evaluation.

### 10. Improving Automated Code Reviews: Learning from Experience

- **Title**: *Improving Automated Code Reviews: Learning from Experience*
- **Authors**: Hong Yi Lin, Patanamon Thongtanunam, Christoph Treude, Wachiraphan Charoenwet
- **Year / Venue**: 2024, ACM/IEEE software engineering venue
- **Relevance to this project**: Suggests that review quality improves when systems learn from historical reviewer behavior and curated training choices.
- **What we adopted**: This informs future extensions toward experience-aware reviewer personalization and better historical training data selection.
- **What we did not adopt**: Experience-aware oversampling or historical reviewer behavior modeling.

## Dataset

The training data for the current Random Forest model is stored at `ml/data/raw/multi_repo_data.csv`, and processed features are stored at `ml/data/processed/processed_data.csv`.

### Data collection strategy

- **Source**: GitHub API
- **Collection script**: `ml/data/data.py`
- **Repository scope**: a large cross-project list of open-source repositories across Python, JavaScript/TypeScript, Rust, Go, systems, tooling, AI, and web ecosystems
- **Sampling rule**: up to `150` recently created closed pull requests per target repository
- **Filter used in the current script**: only merged pull requests are appended to the dataset

### Raw attributes collected

The mining script collects pull request metadata such as:

- repository and PR identifiers
- PR state, draft status, and merged status
- title and body text
- author association and account age
- additions, deletions, changed files, and commit count
- creation time and merge duration
- review comments, issue comments, and requested reviewers
- labels, milestone, branches, and observed file extensions

### Engineered model features

The production model uses **22 engineered features** generated in `ml/apis/predict.py`:

| Category | Features |
| -------- | -------- |
| **Size** | `additions`, `deletions`, `changed_files`, `total_changes`, `change_ratio`, `avg_changes_per_file` |
| **Commits** | `commits_count`, `commits_per_file` |
| **Author** | `author_account_age_days`, `author_association_encoded` |
| **Timing** | `created_day_of_week`, `created_hour`, `is_weekend`, `is_business_hours` |
| **Content** | `body_len`, `title_length`, `has_body`, `has_labels`, `has_milestone`, `has_file_extensions` |
| **Review** | `requested_reviewers_count`, `is_draft` |

### Current dataset caveat

The repository currently documents a merged-PR data collection flow. That means the present dataset is best understood as a cross-project PR metadata corpus used to train the current risk model, not as a rigorously benchmarked public research dataset with published class-balance and evaluation statistics. If this project is extended into a formal research artifact, dataset cardinality, label construction, class balance, and split strategy should be reported explicitly.

## Methodology

The system follows a staged hybrid workflow that combines lightweight metadata-based prediction with selective LLM review.

### Step 1. Pull request ingestion

The backend accepts a GitHub pull request URL, parses the repository owner, repository name, and PR number, and fetches PR metadata plus changed files from the GitHub API.

### Step 2. Feature engineering

The fetched metadata is converted into 22 numerical and binary features in `ml/apis/predict.py`. These features intentionally avoid deep static analysis and instead summarize change size, author context, timing, review setup, and lightweight content signals.

### Step 3. Risk prediction

A Random Forest classifier predicts the probability that a PR is risky. That probability is scaled to a `0.0-10.0` risk score and mapped to the labels `LOW`, `MEDIUM`, and `HIGH`.

### Step 4. Risk-aware diff selection

The project reduces LLM cost and context size by selecting how much diff content to send based on the predicted score:

- **LOW (`<= 3`)**: skip diff review
- **MEDIUM (`4-6`)**: send additions only
- **HIGH (`>= 7`)**: send additions and deletions

### Step 5. Structured LLM review generation

The selected diff and contextual metadata are sent to Gemini 2.5 Flash. The prompt requests a structured response containing:

- risk explanation
- mitigation steps
- per-file findings
- code examples with language tags

### Step 6. Frontend presentation

The React frontend renders the risk score, severity label, and structured review results, while exposing typed errors for invalid URLs, upstream API failures, and server-side problems.

## Pipeline Overview

```text
  GitHub PR URL
       │
       ▼
  ┌─────────────────┐
  │   GitHub API    │  ← PR metadata + file diffs
  └────────┬────────┘
           │
           ▼
  ┌─────────────────────────────┐
  │   Random Forest Model       │  ← 22 engineered features
  │   risk_score  →  0.0 – 10.0 │
  │   risk_label  →  LOW / MEDIUM / HIGH
  └────────┬────────────────────┘
           │
           ├─── score ≤ 3  →  skip diff entirely
           ├─── score 4–6  →  additions only
           └─── score ≥ 7  →  additions + deletions
           │
           ▼
  ┌─────────────────────────────┐
  │   Gemini 2.5 Flash (LLM)   │  ← structured JSON schema
  │   • Executive summary       │
  │   • Mitigation steps        │
  │   • Per-file issues + code  │
  └────────┬────────────────────┘
           │
           ▼
  ┌─────────────────┐
  │  React Frontend │  ← risk score, review, file analysis
  └─────────────────┘
```

## Features

- **ML Risk Scoring** — Random Forest model trained on cross-project PR metadata outputs a `0-10` score and `LOW` / `MEDIUM` / `HIGH` label.
- **Smart Diff Selection** — diff content sent to the LLM is trimmed based on predicted risk to reduce token usage and keep review focused.
- **Structured AI Review** — Gemini returns structured review output containing risk explanation, mitigation steps, and per-file issues.
- **Typed Error Handling** — invalid URLs, GitHub API failures, quota issues, and server crashes surface as explicit UI errors.
- **Responsive Frontend** — React UI presents risk scoring, detailed findings, and loading states in a compact review workflow.

## Tech Stack

| Layer | Technology |
| ----- | ------ |
| Frontend | React, Vite, Tailwind CSS, Axios |
| Backend | FastAPI, Python, httpx (async) |
| ML Model | scikit-learn Random Forest, joblib |
| LLM | Google Gemini 2.5 Flash (`google-genai`) |
| Package Manager | PDM (Python), npm (Node) |

## Project Structure

```text
github-pr-risk-analyzer/
├── .env                          # Root env (GITHUB_TOKEN, GEMINI_API_KEY)
├── pyproject.toml                # PDM project config
├── pdm.lock
├── requirements.txt
├── README.md
│
├── backend/
│   └── app/
│       ├── main.py               # FastAPI app, CORS, exception handlers
│       ├── health.py             # GET /health
│       ├── api/
│       │   └── v1/
│       │       └── analyze.py    # POST /api/v1/analyze/pr
│       ├── core/
│       │   ├── config.py         # Settings: GITHUB_TOKEN, GEMINI_API_KEY
│       │   ├── exceptions.py     # Typed exceptions (GitHub, ML, LLM, URL)
│       │   └── logging.py
│       ├── schemas/
│       │   ├── request.py        # AnalyzePRRequest (Pydantic + URL validator)
│       │   ├── response.py       # AnalyzePRResponse, LLMReview, FileReview
│       │   └── github.py
│       ├── services/
│       │   ├── github_service.py # fetch_pr, fetch_pr_files
│       │   ├── ml_service.py     # prepare_features → predict_risk
│       │   ├── llm_service.py    # Thin wrapper over ml/apis/llm.py
│       │   └── diff_selector.py  # Smart diff trimming by risk score
│       └── utils/
│           ├── pr_parser.py      # Parses owner/repo/number from URL
│           └── diff_utils.py
│
├── ml/
│   ├── apis/
│   │   ├── predict.py            # 22-feature engineering + RF inference
│   │   └── llm.py                # Gemini API, prompt builder, JSON schema, retry
│   ├── models/
│   │   ├── rf_model.joblib       # Trained Random Forest model
│   │   ├── feature_columns.joblib
│   │   ├── model.py              # Training script
│   │   └── eda.ipynb             # Exploratory data analysis
│   └── data/
│       ├── data.py
│       ├── raw/
│       │   └── multi_repo_data.csv
│       └── processed/
│           └── processed_data.csv
│
├── frontend/
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx               # Root: wires analyzer → skeleton → results
│       ├── main.jsx
│       ├── components/
│       │   ├── features/
│       │   │   ├── PRAnalyzer.jsx       # URL input form + inline validation
│       │   │   ├── ResultsPanel.jsx     # Full results UI with syntax highlighting
│       │   │   ├── SkeletonLoader.jsx   # Animated layout skeleton while analyzing
│       │   │   └── RiskVisualization.jsx
│       │   ├── common/
│       │   │   ├── ErrorMessage.jsx
│       │   │   └── LoadingSpinner.jsx
│       │   ├── layout/
│       │   │   ├── Header.jsx
│       │   │   ├── Footer.jsx
│       │   │   └── Layout.jsx
│       │   └── ui/
│       │       ├── Button.jsx
│       │       ├── Input.jsx
│       │       ├── Card.jsx
│       │       ├── Badge.jsx
│       │       └── Progress.jsx
│       ├── hooks/
│       │   └── useAnalyzePR.js   # API state: data, loading, error
│       ├── services/
│       │   └── api.js            # Axios + typed error parsing
│       ├── config/
│       │   └── constants.js      # API_BASE_URL, APP_CONFIG
│       └── utils/
│           └── validators.js     # validateGitHubURL
```

## ML Model

The current predictive model is a `RandomForestClassifier` trained with `class_weight="balanced"` and a custom decision threshold in `ml/models/model.py`. It is designed as a practical baseline model for metadata-driven PR risk estimation.

### Current modeling characteristics

- **Model family**: Random Forest classifier
- **Training split**: `train_test_split(..., test_size=0.2, random_state=42, stratify=y)`
- **Class balancing**: `class_weight="balanced"`
- **Thresholding**: probability threshold adjusted to `0.3` during training-time evaluation
- **Artifacts saved**: `rf_model.joblib`, `feature_columns.joblib`

### Scope of prediction

This model predicts a repository-specific notion of PR risk used for triage in this application. In the current implementation, the README should treat the model as an engineering artifact for prioritization rather than a formally validated research benchmark.

## API Reference

### **POST /api/v1/analyze/pr**

#### Request

```json
{
  "pr_url": "https://github.com/owner/repo/pull/123"
}
```

#### Response

```json
{
  "risk_label": "HIGH",
  "risk_score": 7.4,
  "review_comments": {
    "risk_explanation": "This PR introduces significant changes across auth-critical files...",
    "mitigation_steps": [
      "Add input validation to the new endpoint",
      "Request a security-focused reviewer"
    ],
    "file_reviews": [
      {
        "file": "src/auth/login.py",
        "issues": [
          {
            "description": "SQL query is not parameterized — vulnerable to injection",
            "code_example": "cursor.execute(f'SELECT * FROM users WHERE id = {user_id}')",
            "language": "python"
          }
        ]
      }
    ]
  }
}
```

#### Error Responses

| Status | Cause |
| ------ | ----- |
| `400` | Invalid PR URL format |
| `422` | Pydantic validation failure |
| `502` | GitHub API error or missing/invalid token |
| `500` | ML model unavailable or internal server error |

### **GET /health**

Returns server status.

## Setup

### Prerequisites

- Python 3.12+
- Node.js 18+
- [PDM](https://pdm-project.org/) — Python package manager
- A GitHub personal access token with permission to read the pull requests you want to analyze
- A Google Gemini API key

### 1. Clone

```bash
git clone https://github.com/ShaikSazid/github-pr-risk-analyzer.git
cd github-pr-risk-analyzer
```

### 2. Environment Variables

Create a `.env` file in the project root:

```env
GITHUB_TOKEN=your_github_personal_access_token
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Backend

```bash
pdm install
pdm run uvicorn backend.app.main:app --reload
```

Run the backend from the repository root.

### 4. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

```bash
npm run dev
```

Run the frontend in a second terminal. The app runs at `http://localhost:5173`.

## Usage

1. Open `http://localhost:5173`
2. Paste a GitHub PR URL — e.g. `https://github.com/facebook/react/pull/31000`
3. Click **Analyze PR**
4. The loader appears while the ML model and Gemini process the PR
5. Results appear with a risk score, summary, mitigation steps, and per-file findings

## Error States

The frontend surfaces every failure with a specific message — nothing is swallowed silently.

| Error | What the user sees |
| ----- | ----- |
| Invalid URL format | Inline validation under the input field |
| PR not found / private | GitHub API error message |
| LLM quota exceeded | AI quota error message |
| Server unreachable | Connection error message |
| ML model down | Server error message |
| Request timeout | Timeout message with suggestion to retry |

## Possible Future Work

- **Reviewer feedback loop** — collect reviewer confirmations or overrides and feed them back into future model updates, inspired by human-in-the-loop defect prediction work.
- **Stronger risk models** — compare the current Random Forest baseline against gradient boosting, transformer-based text models, or diff-aware classifiers.
- **Repository-aware policies** — allow custom thresholds, organization-specific rule packs, and team-level security review policies.
- **Evaluation and benchmarking** — publish dataset statistics, labeling strategy, ablation studies, and comparative metrics for both the risk model and the LLM review stage.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.