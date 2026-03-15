import { useState, useEffect, useCallback, useMemo } from 'react'
import * as settlementService from '../api/settlementService.js'

export function useSettlements(filters = {}) {
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Create a stable key from filters to prevent infinite loops when filters object is recreated
  // JSON.stringify creates a stable string that only changes when filter values actually change
  // For empty objects {}, JSON.stringify always returns "{}", so it's stable
  const filtersKey = JSON.stringify(filters)

  const fetchSettlements = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await settlementService.getSettlements(filters)
      setSettlements(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch settlements')
      console.error('Error fetching settlements:', err)
    } finally {
      setLoading(false)
    }
  }, [filtersKey])

  useEffect(() => {
    fetchSettlements()
  }, [fetchSettlements])

  const createSettlement = useCallback(async (settlementData) => {
    try {
      setError(null)
      const newSettlement = await settlementService.createSettlement(settlementData)
      setSettlements(prev => [newSettlement, ...prev])
      return newSettlement
    } catch (err) {
      setError(err.message || 'Failed to create settlement')
      throw err
    }
  }, [])

  const updateSettlement = useCallback(async (settlementId, updates) => {
    try {
      setError(null)
      const updatedSettlement = await settlementService.updateSettlement(settlementId, updates)
      setSettlements(prev => prev.map(s => s.id === settlementId ? updatedSettlement : s))
      return updatedSettlement
    } catch (err) {
      setError(err.message || 'Failed to update settlement')
      throw err
    }
  }, [])

  const deleteSettlement = useCallback(async (settlementId) => {
    try {
      setError(null)
      await settlementService.deleteSettlement(settlementId)
      setSettlements(prev => prev.filter(s => s.id !== settlementId))
      return true
    } catch (err) {
      setError(err.message || 'Failed to delete settlement')
      throw err
    }
  }, [])

  const refreshSettlements = useCallback(() => {
    fetchSettlements()
  }, [fetchSettlements])

  return {
    settlements,
    loading,
    error,
    createSettlement,
    updateSettlement,
    deleteSettlement,
    refreshSettlements,
  }
}
