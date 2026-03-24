class ApplicationError(Exception):
    def __init__(self, message: str, error_code: str = "APPLICATION_ERROR"):
        self.message = message
        self.error_code = error_code
        super().__init__(message)


class InvalidPullRequestURLError(ApplicationError):
    def __init__(self, message="Invalid GitHub Pull Request URL"):
        super().__init__(message, "INVALID_PR_URL")


class GitHubAPIError(ApplicationError):
    def __init__(self, message="GitHub API Error"):
        super().__init__(message, "GITHUB_API_ERROR")


class MLServiceError(ApplicationError):
    def __init__(self, message="ML Service Error"):
        super().__init__(message, "ML_SERVICE_ERROR")


class LLMServiceError(ApplicationError):
    def __init__(self, message="LLM Service Error"):
        super().__init__(message, "LLM_SERVICE_ERROR")


class LLMQuotaExceededError(ApplicationError):
    def __init__(self, message="LLM quota exceeded"):
        super().__init__(message, "LLM_QUOTA_EXCEEDED")