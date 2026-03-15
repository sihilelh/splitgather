import { apiRequest, ApiError } from './client.js'

export class SettlementError extends ApiError {
  constructor(message, status, data) {
    super(message, status, data)
    this.name = 'SettlementError'
  }
}

/**
 * Create a new settlement
 * @param {Object} settlementData - Settlement data
 * @param {number} settlementData.payerId - User ID who is paying
 * @param {number} settlementData.receiverId - User ID who is receiving
 * @param {number} settlementData.amount - Settlement amount
 * @param {number} [settlementData.groupId] - Optional group ID
 * @param {string} [settlementData.note] - Optional note
 * @returns {Promise<Object>} Created settlement
 */
export async function createSettlement(settlementData) {
  try {
    const result = await apiRequest('/settlements', {
      method: 'POST',
      body: settlementData,
    })
    return result.settlement || null
  } catch (err) {
    if (err instanceof ApiError) {
      throw new SettlementError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Get settlement by ID
 * @param {number} settlementId - Settlement ID
 * @returns {Promise<Object>} Settlement
 */
export async function getSettlementById(settlementId) {
  try {
    const result = await apiRequest(`/settlements/${settlementId}`, {
      method: 'GET',
    })
    return result.settlement || null
  } catch (err) {
    if (err instanceof ApiError) {
      throw new SettlementError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Update a settlement
 * @param {number} settlementId - Settlement ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated settlement
 */
export async function updateSettlement(settlementId, updates) {
  try {
    const result = await apiRequest(`/settlements/${settlementId}`, {
      method: 'PUT',
      body: updates,
    })
    return result.settlement || null
  } catch (err) {
    if (err instanceof ApiError) {
      throw new SettlementError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Delete a settlement
 * @param {number} settlementId - Settlement ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteSettlement(settlementId) {
  try {
    await apiRequest(`/settlements/${settlementId}`, {
      method: 'DELETE',
    })
    return true
  } catch (err) {
    if (err instanceof ApiError) {
      throw new SettlementError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Get settlements
 * @param {Object} [filters] - Optional filters
 * @param {number} [filters.userId] - Filter by user ID (get settlements between current user and this user)
 * @param {number} [filters.groupId] - Filter by group ID
 * @returns {Promise<Array>} Array of settlements
 */
export async function getSettlements(filters = {}) {
  try {
    const params = new URLSearchParams()
    if (filters.userId) {
      params.append('userId', filters.userId.toString())
    }
    if (filters.groupId) {
      params.append('groupId', filters.groupId.toString())
    }
    const queryString = params.toString()
    const path = queryString ? `/settlements?${queryString}` : '/settlements'
    
    const result = await apiRequest(path, {
      method: 'GET',
    })
    return result.settlements || []
  } catch (err) {
    if (err instanceof ApiError) {
      throw new SettlementError(err.message, err.status, err.data)
    }
    throw err
  }
}
