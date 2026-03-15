import { apiRequest, ApiError } from './client.js'

export class RecordError extends ApiError {
  constructor(message, status, data) {
    super(message, status, data)
    this.name = 'RecordError'
  }
}

/**
 * Create a new expense record
 * @param {Object} recordData - Record data
 * @param {string} recordData.description - Expense description
 * @param {number} recordData.amount - Expense amount
 * @param {number} [recordData.groupId] - Optional group ID
 * @param {number} recordData.paidBy - User ID who paid
 * @param {Array<number>} recordData.participantIds - Array of user IDs involved
 * @param {string} recordData.splitMode - 'equal', 'percentage', or 'custom'
 * @param {Object} [recordData.splitData] - Split data (percentages or custom amounts)
 * @param {string} [recordData.category] - Optional category
 * @param {string} [recordData.expenseDate] - Optional expense date (ISO string)
 * @returns {Promise<Object>} Created record
 */
export async function createRecord(recordData) {
  try {
    const result = await apiRequest('/records', {
      method: 'POST',
      body: recordData,
    })
    return result.record || null
  } catch (err) {
    if (err instanceof ApiError) {
      throw new RecordError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Get record by ID
 * @param {number} recordId - Record ID
 * @returns {Promise<Object>} Record with splits
 */
export async function getRecordById(recordId) {
  try {
    const result = await apiRequest(`/records/${recordId}`, {
      method: 'GET',
    })
    return result.record || null
  } catch (err) {
    if (err instanceof ApiError) {
      throw new RecordError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Update a record
 * @param {number} recordId - Record ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated record
 */
export async function updateRecord(recordId, updates) {
  try {
    const result = await apiRequest(`/records/${recordId}`, {
      method: 'PUT',
      body: updates,
    })
    return result.record || null
  } catch (err) {
    if (err instanceof ApiError) {
      throw new RecordError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Delete a record
 * @param {number} recordId - Record ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteRecord(recordId) {
  try {
    await apiRequest(`/records/${recordId}`, {
      method: 'DELETE',
    })
    return true
  } catch (err) {
    if (err instanceof ApiError) {
      throw new RecordError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Get records for the current user
 * @param {Object} [filters] - Optional filters
 * @param {number} [filters.groupId] - Filter by group ID
 * @returns {Promise<Array>} Array of records
 */
export async function getRecords(filters = {}) {
  try {
    const params = new URLSearchParams()
    if (filters.groupId) {
      params.append('groupId', filters.groupId.toString())
    }
    const queryString = params.toString()
    const path = queryString ? `/records?${queryString}` : '/records'
    
    const result = await apiRequest(path, {
      method: 'GET',
    })
    return result.records || []
  } catch (err) {
    if (err instanceof ApiError) {
      throw new RecordError(err.message, err.status, err.data)
    }
    throw err
  }
}
