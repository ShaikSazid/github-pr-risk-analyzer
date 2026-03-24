import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.v1.analyze import router as analyze_router
from backend.app.health import router as health_router
from backend.app.core.exceptions import (
    ApplicationError,
    GitHubAPIError,
    InvalidPullRequestURLError,
    MLServiceError,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s:%(name)s:%(message)s",
)

app = FastAPI(title="GitHub PR Risk Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Specific Error Handlers


@app.exception_handler(GitHubAPIError)
async def github_error_handler(request: Request, exc: GitHubAPIError):
    return JSONResponse(
        status_code=400,
        content={"message": exc.message},
    )


@app.exception_handler(InvalidPullRequestURLError)
async def invalid_pr_handler(request: Request, exc: InvalidPullRequestURLError):
    return JSONResponse(
        status_code=400,
        content={"message": "Invalid Pull Request URL."},
    )


@app.exception_handler(MLServiceError)
async def ml_service_handler(request: Request, exc: MLServiceError):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Risk prediction service is temporarily unavailable. Please try again later."
        },
    )


@app.exception_handler(ApplicationError)
async def application_error_handler(request: Request, exc: ApplicationError):
    return JSONResponse(
        status_code=500,
        content={"message": "Unexpected server error. Please try again later."},
    )


app.include_router(health_router)
app.include_router(analyze_router, prefix="/api/v1")
