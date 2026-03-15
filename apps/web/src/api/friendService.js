import { apiRequest, ApiError } from './client.js'

export class FriendError extends ApiError {
  constructor(message, status, data) {
    super(message, status, data)
    this.name = 'FriendError'
  }
}

/**
 * Search users by name or email (excludes existing friends - for adding new friends)
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of users matching the query
 */
export async function searchUsers(query) {
  try {
    const result = await apiRequest(`/friends/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    })
    return result.results || []
  } catch (err) {
    if (err instanceof ApiError) {
      throw new FriendError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Search existing friends by name or email (for group creation)
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of friends matching the query
 */
export async function searchFriends(query) {
  try {
    const result = await apiRequest(`/friends/search-friends?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    })
    return result.results || []
  } catch (err) {
    if (err instanceof ApiError) {
      throw new FriendError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Get friends list with balances
 * @returns {Promise<Object>} Friends list categorized by balance
 */
export async function getFriends() {
  try {
    const result = await apiRequest('/friends', {
      method: 'GET',
    })
    return {
      all: result.all || [],
      oweYou: result.oweYou || [],
      youOwe: result.youOwe || [],
      settled: result.settled || [],
    }
  } catch (err) {
    if (err instanceof ApiError) {
      throw new FriendError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Add a friend instantly (no approval needed)
 * @param {number} friendId - Friend user ID to add
 * @returns {Promise<Object>} Created or existing friend relationship
 */
export async function addFriend(friendId) {
  try {
    const result = await apiRequest('/friends', {
      method: 'POST',
      body: { friendId },
    })
    return result.friend || null
  } catch (err) {
    if (err instanceof ApiError) {
      throw new FriendError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Get friend balances summary
 * @returns {Promise<Object>} Balance summary with totals
 */
export async function getFriendBalances() {
  try {
    const result = await apiRequest('/friends/balances', {
      method: 'GET',
    })
    return {
      totalOwed: result.totalOwed || 0,
      totalOwe: result.totalOwe || 0,
      netBalance: result.netBalance || 0,
      friends: result.friends || [],
    }
  } catch (err) {
    if (err instanceof ApiError) {
      throw new FriendError(err.message, err.status, err.data)
    }
    throw err
  }
}
