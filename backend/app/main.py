from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from backend.app.api.v1.analyze import router as analyze_router
from backend.app.health import router as health_router
from backend.app.core.exceptions import (
    GitHubAPIError,
    InvalidPullRequestURLError,
    ApplicationError,
)

app = FastAPI(title="GitHub PR Risk Analyzer")

@app.exception_handler(GitHubAPIError)
async def github_api_exception_handler(request: Request, exc: GitHubAPIError):
    return JSONResponse(
        status_code=502,
        content={
            "message": "GitHub API Error",
            "detail": str(exc),
        },
    )

@app.exception_handler(InvalidPullRequestURLError)
async def invalid_pr_handler(request: Request, exc: InvalidPullRequestURLError):
    return JSONResponse(
        status_code=400,
        content={
            "message": "Invalid Pull Request URL",
            "detail": str(exc),
        },
    )

@app.exception_handler(ApplicationError)
async def application_error_handler(request: Request, exc: ApplicationError):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Application Error",
            "detail": str(exc),
        },
    )


app.include_router(health_router)
app.include_router(analyze_router, prefix="/api/v1")