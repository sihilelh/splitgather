import { useState, useEffect, useCallback } from 'react'
import * as friendService from '../api/friendService.js'

export function useBalances() {
  const [totalOwed, setTotalOwed] = useState(0)
  const [totalOwe, setTotalOwe] = useState(0)
  const [netBalance, setNetBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBalances = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await friendService.getFriendBalances()
      setTotalOwed(data.totalOwed || 0)
      setTotalOwe(data.totalOwe || 0)
      setNetBalance(data.netBalance || 0)
    } catch (err) {
      setError(err.message || 'Failed to fetch balances')
      console.error('Error fetching balances:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBalances()
  }, [fetchBalances])

  const refreshBalances = useCallback(() => {
    fetchBalances()
  }, [fetchBalances])

  return {
    totalOwed,
    totalOwe,
    netBalance,
    loading,
    error,
    refreshBalances,
  }
}
