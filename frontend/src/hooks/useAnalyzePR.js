import { useState } from 'react'
import { analyzePR } from '../services/api'

export function useAnalyzePR() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyze = async (prUrl) => {
    try {
      setLoading(true)
      setError(null)

      const result = await analyzePR(prUrl)
      setData(result)

    } catch (err) {
      setError(err.message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setData(null)
    setError(null)
    setLoading(false)
  }

  return { analyze, data, loading, error, reset }
}