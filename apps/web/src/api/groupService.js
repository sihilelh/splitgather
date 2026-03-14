import { apiRequest, ApiError } from './client.js'

export class GroupError extends ApiError {
  constructor(message, status, data) {
    super(message, status, data)
    this.name = 'GroupError'
  }
}

/**
 * Create a new group
 * @param {Object} groupData - Group data
 * @param {string} groupData.name - Group name
 * @param {string} [groupData.description] - Group description
 * @param {string} [groupData.icon] - Group icon/emoji
 * @param {Array<number>} [groupData.memberIds] - Array of friend IDs to add
 * @returns {Promise<Object>} Created group
 */
export async function createGroup(groupData) {
  try {
    const result = await apiRequest('/groups', {
      method: 'POST',
      body: groupData,
    })
    return result.group || null
  } catch (err) {
    if (err instanceof ApiError) {
      throw new GroupError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Get all groups for the current user
 * @returns {Promise<Array>} Array of groups
 */
export async function getUserGroups() {
  try {
    const result = await apiRequest('/groups', {
      method: 'GET',
    })
    return result.groups || []
  } catch (err) {
    if (err instanceof ApiError) {
      throw new GroupError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Get group by ID
 * @param {number} groupId - Group ID
 * @returns {Promise<Object>} Group details
 */
export async function getGroupById(groupId) {
  try {
    const result = await apiRequest(`/groups/${groupId}`, {
      method: 'GET',
    })
    return result.group || null
  } catch (err) {
    if (err instanceof ApiError) {
      throw new GroupError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Add members to a group
 * @param {number} groupId - Group ID
 * @param {Array<number>} memberIds - Array of friend IDs to add
 * @returns {Promise<Object>} Updated group
 */
export async function addMembersToGroup(groupId, memberIds) {
  try {
    const result = await apiRequest(`/groups/${groupId}/members`, {
      method: 'POST',
      body: { memberIds },
    })
    return result.group || null
  } catch (err) {
    if (err instanceof ApiError) {
      throw new GroupError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Remove a member from a group
 * @param {number} groupId - Group ID
 * @param {number} memberId - Member user ID to remove
 * @returns {Promise<Object>} Updated group
 */
export async function removeMemberFromGroup(groupId, memberId) {
  try {
    const result = await apiRequest(`/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    })
    return result.group || null
  } catch (err) {
    if (err instanceof ApiError) {
      throw new GroupError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Exit a group
 * @param {number} groupId - Group ID
 * @returns {Promise<boolean>} Success status
 */
export async function exitGroup(groupId) {
  try {
    await apiRequest(`/groups/${groupId}/exit`, {
      method: 'DELETE',
    })
    return true
  } catch (err) {
    if (err instanceof ApiError) {
      throw new GroupError(err.message, err.status, err.data)
    }
    throw err
  }
}

/**
 * Search friends for adding to group
 * @param {number} groupId - Group ID
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of friends matching query
 */
export async function searchFriendsForGroup(groupId, query) {
  try {
    const result = await apiRequest(`/groups/${groupId}/friends/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
    })
    return result.results || []
  } catch (err) {
    if (err instanceof ApiError) {
      throw new GroupError(err.message, err.status, err.data)
    }
    throw err
  }
}
