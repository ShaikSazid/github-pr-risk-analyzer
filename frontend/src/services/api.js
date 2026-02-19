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
  (response) => {
    console.log('✅ API Response:', response.data)  // ← Add this
    return response
  },
  (error) => {
    console.error('❌ API Error:', error)
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. The analysis took too long. Please try again.')
    }
    throw new Error(error.message || 'An unexpected error occurred')
  }
)

export const analyzePR = async (prUrl) => {
  const response = await api.post('/api/v1/analyze/pr', {
    pr_url: prUrl,
  })
  console.log('📦 Full response data:', response.data)  // ← Add this
  return response.data
}

export default api