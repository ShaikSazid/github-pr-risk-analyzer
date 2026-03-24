import { GITHUB_URL_REGEX } from '../config/constants'

export const validateGitHubURL = (url) => {
  if (!url.trim()) {
    return 'Please enter a GitHub PR URL'
  }
  
  if (!GITHUB_URL_REGEX.test(url.trim())) {
    return 'Please enter a valid GitHub PR URL (e.g., https://github.com/owner/repo/pull/123)'
  }
  
  return null
}

export const formatRiskScore = (score) => {
  return `${score.toFixed(1)}/10`
}

export const getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case 'LOW':
      return 'text-emerald-600'
    case 'MEDIUM':
      return 'text-amber-600'
    case 'HIGH':
      return 'text-red-600'
    default:
      return 'text-slate-600'
  }
}