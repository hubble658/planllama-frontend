import { useState } from 'react'

export function useAPI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = async (apiCall) => {
    try {
      setLoading(true)
      setError(null)
      return await apiCall()
    } catch (err) {
      setError(err?.message || String(err))
      console.error('API Error:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, execute }
}