class ApplicationError(Exception):
    pass

class InvalidPullRequestURLError(ApplicationError):
    pass

class GitHubAPIError(ApplicationError):
    pass

class MLServiceError(ApplicationError):
    pass

class LLMServiceError(ApplicationError):
    pass