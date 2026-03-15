import { useState, useEffect, useCallback } from 'react'
import * as friendService from '../api/friendService.js'

export function useFriends() {
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load friends on mount
  useEffect(() => {
    refreshFriends()
  }, [])

  /**
   * Refresh friends list from API
   */
  const refreshFriends = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const friendsData = await friendService.getFriends()
      setFriends(friendsData.all || [])
    } catch (err) {
      setError(err.message || 'Failed to load friends')
      console.error('Failed to load friends:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Search users by name or email (excludes existing friends - for adding new friends)
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of users matching the query
   */
  const searchUsers = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      return []
    }
    try {
      const results = await friendService.searchUsers(query.trim())
      return results
    } catch (err) {
      console.error('Failed to search users:', err)
      throw err
    }
  }, [])

  /**
   * Search existing friends by name or email (for group creation)
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of friends matching the query
   */
  const searchFriends = useCallback(async (query) => {
    if (!query || query.trim().length === 0) {
      return []
    }
    try {
      const results = await friendService.searchFriends(query.trim())
      return results
    } catch (err) {
      console.error('Failed to search friends:', err)
      throw err
    }
  }, [])

  /**
   * Add a friend instantly (no approval needed)
   * @param {number} friendId - Friend user ID to add
   */
  const addFriend = useCallback(async (friendId) => {
    try {
      await friendService.addFriend(friendId)
      // Refresh friends list after adding
      await refreshFriends()
    } catch (err) {
      console.error('Failed to add friend:', err)
      throw err
    }
  }, [refreshFriends])

  /**
   * Get categorized friends
   * @returns {Object} Friends categorized by balance
   */
  const getFriendsByCategory = useCallback(() => {
    const oweYou = friends
      .filter(f => f.balance < 0) // Friend owes you
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)) // Sort by absolute value descending

    const youOwe = friends
      .filter(f => f.balance > 0) // You owe friend
      .sort((a, b) => b.balance - a.balance) // Sort descending

    const settled = friends.filter(f => f.balance === 0)

    return {
      oweYou,
      youOwe,
      settled,
    }
  }, [friends])

  return {
    friends,
    loading,
    error,
    searchUsers,
    searchFriends,
    addFriend,
    refreshFriends,
    getFriendsByCategory,
  }
}
