import uvicorn
from backend.app.api.v1.analyze import router as analyze_router
from backend.app.core.exceptions import (
    ApplicationError,
    GitHubAPIError,
    InvalidPullRequestURLError,
)
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.app.health import router as health_router

import logging

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

# if __name__ == "__main__":
#     uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
