import axios from 'axios'
import { API_BASE_URL } from '../config/constants'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error("The analysis took too long. Please try again.")
    }

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }

    if (error.response?.status === 422 && error.response?.data?.detail) {
      return Promise.reject(
        new Error(
          "Invalid GitHub Pull Request URL. Please use format: https://github.com/owner/repo/pull/123"
        )
      )
    }

    if (error.response?.status === 502) {
      return Promise.reject(
        new Error(
          "Pull Request not found or repository is private."
        )
      )
    }

    return Promise.reject(
      new Error("Something went wrong. Please try again.")
    )
  }
)

export const analyzePR = async (prUrl) => {
  const response = await api.post('/api/v1/analyze/pr', {
    pr_url: prUrl,
  })
  return response.data
}

export default api