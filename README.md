# GitHub PR Risk Analyzer

> An internal AI-powered security review tool that scores risk on GitHub Pull Requests using a trained ML model, then generates a deep code review using Google Gemini 2.5 Flash.

---

## Pipeline Overview

```
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

---

## Features

- **ML Risk Scoring** — Random Forest model trained on multi-repository PR data outputs a 0–10 score and LOW / MEDIUM / HIGH label
- **Smart Diff Selection** — diff sent to the LLM is trimmed based on risk score, keeping token usage minimal and focused
- **Structured AI Review** — Gemini returns strict JSON: executive summary, mitigation steps, and per-file issues with syntax-highlighted code examples
- **Skeleton Loading** — animated layout skeleton mirrors the exact structure of the results panel while analysis runs
- **Typed Error Handling** — invalid URLs, GitHub API failures, LLM quota exhaustion, and server crashes each surface with specific, clear messages in the UI
- **Glassmorphism UI** — clean, modern React frontend with a dark code viewer, animated results panel, and responsive layout

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Axios |
| Backend | FastAPI, Python, httpx (async) |
| ML Model | scikit-learn Random Forest, joblib |
| LLM | Google Gemini 2.5 Flash (`google-genai`) |
| Package Manager | PDM (Python), npm (Node) |

---

## Project Structure

```
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

---

## ML Model

The Random Forest model uses **22 features** extracted purely from GitHub API metadata — no source code reading required at the ML layer.

| Category | Features |
|---|---|
| **Size** | `additions`, `deletions`, `changed_files`, `total_changes`, `change_ratio`, `avg_changes_per_file` |
| **Commits** | `commits_count`, `commits_per_file` |
| **Author** | `author_account_age_days`, `author_association_encoded` |
| **Timing** | `created_day_of_week`, `created_hour`, `is_weekend`, `is_business_hours` |
| **Content** | `body_len`, `title_length`, `has_body`, `has_labels`, `has_milestone`, `has_file_extensions` |
| **Review** | `requested_reviewers_count`, `is_draft` |

Training data: `ml/data/raw/multi_repo_data.csv`

---

## API Reference

### `POST /api/v1/analyze/pr`

**Request**
```json
{
  "pr_url": "https://github.com/owner/repo/pull/123"
}
```

**Response**
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

**Error Responses**

| Status | Cause |
|---|---|
| `400` | Invalid PR URL format |
| `422` | Pydantic validation failure |
| `502` | GitHub API error or missing/invalid token |
| `500` | ML model unavailable or internal server error |

### `GET /health`

Returns server status.

---

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- [PDM](https://pdm-project.org/) — Python package manager
- A GitHub personal access token
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

App runs at `http://localhost:5173`.

---

## Usage

1. Open `http://localhost:5173`
2. Paste a GitHub PR URL — e.g. `https://github.com/facebook/react/pull/31000`
3. Click **Analyze PR**
4. The skeleton loader appears while the ML model and Gemini process the PR
5. Results appear with a risk score, executive summary, mitigation steps, and per-file findings with code examples

---

## Error States

The frontend surfaces every failure with a specific message — nothing is swallowed silently.

| Error | What the user sees |
|---|---|
| Invalid URL format | Inline validation under the input field |
| PR not found / private | GitHub API error message |
| LLM quota exceeded | AI quota error message |
| Server unreachable | Connection error message |
| ML model down | Server error message |
| Request timeout | Timeout message with suggestion to retry |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.