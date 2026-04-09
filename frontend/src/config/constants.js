export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const APP_CONFIG = {
  name: "GitHub PR Risk Analyzer",
  version: "1.7.2",
  description: "AI-powered GitHub PR risk assessment",
};

export const GITHUB_URL_REGEX =
  /^https:\/\/github\.com\/[A-Za-z0-9](?:-?[A-Za-z0-9])*\/[A-Za-z0-9._-]+\/pull\/\d+$/;
