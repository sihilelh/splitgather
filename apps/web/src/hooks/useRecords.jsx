import { useState, useEffect, useCallback, useMemo } from 'react'
import * as recordService from '../api/recordService.js'
import { transformRecordsToExpenses, transformRecordToExpense } from '../utils/recordTransform.js'
import { useAuth } from './useAuth.jsx'

// Stable empty object to avoid recreating on each render
const EMPTY_FILTERS = {}

export function useRecords(filters = EMPTY_FILTERS) {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Create stable filter key - only depend on actual filter values
  const filterKey = useMemo(() => {
    return filters?.groupId ? `groupId:${filters.groupId}` : 'all'
  }, [filters?.groupId])

  const fetchRecords = useCallback(async () => {
    if (!user) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await recordService.getRecords(filters)
      setRecords(data)
    } catch (err) {
      setError(err.message || 'Failed to fetch records')
      console.error('Error fetching records:', err)
    } finally {
      setLoading(false)
    }
  }, [filterKey, user]) // Use filterKey instead of filters object

  useEffect(() => {
    if (user) {
      fetchRecords()
    } else {
      setLoading(false)
      setRecords([])
    }
  }, [fetchRecords, user])

  const createRecord = useCallback(async (recordData) => {
    try {
      setError(null)
      const newRecord = await recordService.createRecord(recordData)
      setRecords(prev => [newRecord, ...prev])
      return newRecord
    } catch (err) {
      setError(err.message || 'Failed to create record')
      throw err
    }
  }, [])

  const updateRecord = useCallback(async (recordId, updates) => {
    try {
      setError(null)
      const updatedRecord = await recordService.updateRecord(recordId, updates)
      setRecords(prev => prev.map(r => r.id === recordId ? updatedRecord : r))
      return updatedRecord
    } catch (err) {
      setError(err.message || 'Failed to update record')
      throw err
    }
  }, [])

  const deleteRecord = useCallback(async (recordId) => {
    try {
      setError(null)
      await recordService.deleteRecord(recordId)
      setRecords(prev => prev.filter(r => r.id !== recordId))
      return true
    } catch (err) {
      setError(err.message || 'Failed to delete record')
      throw err
    }
  }, [])

  const refreshRecords = useCallback(() => {
    fetchRecords()
  }, [fetchRecords])

  // Transform records to expenses format for backward compatibility
  const transformedRecords = useMemo(() => {
    if (!user) return []
    return transformRecordsToExpenses(records, user.id)
  }, [records, user])

  // Transform single record to expense format
  const transformRecord = useCallback((record) => {
    if (!user || !record) return null
    return transformRecordToExpense(record, user.id)
  }, [user])

  return {
    records, // Raw API records
    expenses: transformedRecords, // Transformed to expense format (for backward compatibility)
    loading,
    error,
    createRecord,
    updateRecord,
    deleteRecord,
    refreshRecords,
    transformRecord,
  }
}
