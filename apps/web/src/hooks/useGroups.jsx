import { useState, useEffect, useCallback } from 'react'
import * as groupService from '../api/groupService.js'
import { useAuth } from './useAuth.jsx'

/**
 * Format amount in LKR format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount string
 */
function formatLKR(amount) {
  return `LKR ${Math.abs(amount).toFixed(2)}`
}

/**
 * Get user initials from name
 * @param {string} name - User name
 * @returns {string} Initials
 */
function getInitials(name) {
  if (!name) return '??'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

/**
 * Get color for user based on ID
 * @param {number} id - User ID
 * @returns {string} Color hex code
 */
function getUserColor(id) {
  const colors = ['#1FD888', '#ff4b5a', '#ffb938', '#4dabf7', '#a78bfa', '#f97316', '#ec4899', '#06b6d4']
  return colors[id % colors.length]
}

export function useGroups() {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [groupDetails, setGroupDetails] = useState({}) // Cache for individual group details

  // Load groups on mount
  useEffect(() => {
    if (user) {
      refreshGroups()
    }
  }, [user])

  /**
   * Refresh groups list from API
   */
  const refreshGroups = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const groupsData = await groupService.getUserGroups()
      // Transform groups to include UI-friendly fields
      const transformed = groupsData.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description || '',
        icon: g.icon || '🏠',
        color: getUserColor(g.id),
        participantCount: g.participantCount || 0,
        balance: 0, // Will be updated when viewing group details
        createdAt: g.createdAt,
      }))
      setGroups(transformed)
    } catch (err) {
      setError(err.message || 'Failed to load groups')
      console.error('Failed to load groups:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create a new group
   * @param {Object} groupData - Group data
   * @param {string} groupData.name - Group name
   * @param {string} [groupData.icon] - Group icon/emoji
   * @param {string} [groupData.description] - Group description
   * @param {Array<number>} [groupData.memberIds] - Array of friend IDs to add
   * @returns {Promise<Object>} Created group
   */
  const createGroup = useCallback(async (groupData) => {
    try {
      const created = await groupService.createGroup(groupData)
      // Transform and add to groups list
      const transformed = {
        id: created.id,
        name: created.name,
        description: created.description || '',
        icon: created.icon || '🏠',
        color: getUserColor(created.id),
        participantCount: created.participants?.length || 0,
        balance: created.userBalance || 0,
        createdAt: created.createdAt,
      }
      setGroups(prev => [transformed, ...prev])
      // Cache group details
      setGroupDetails(prev => ({
        ...prev,
        [created.id]: transformGroupDetails(created),
      }))
      return transformed
    } catch (err) {
      console.error('Failed to create group:', err)
      throw err
    }
  }, [])

  /**
   * Transform group details for UI
   */
  const transformGroupDetails = useCallback((group) => {
    if (!group) return null

    const participants = (group.participants || []).map(p => ({
      id: p.userId,
      name: p.user?.name || 'Unknown',
      email: p.user?.email || '',
      initials: getInitials(p.user?.name || ''),
      color: getUserColor(p.userId),
      owsAmount: p.owsAmount || 0,
      joinedAt: p.joinedAt,
    }))

    return {
      id: group.id,
      name: group.name,
      description: group.description || '',
      icon: group.icon || '🏠',
      color: getUserColor(group.id),
      createdBy: group.createdBy,
      createdAt: group.createdAt,
      participants,
      userBalance: group.userBalance || 0,
    }
  }, [])

  /**
   * Get group by ID (with caching)
   * @param {number} groupId - Group ID
   * @returns {Promise<Object>} Group details
   */
  const getGroupById = useCallback(async (groupId) => {
    // Check cache first
    if (groupDetails[groupId]) {
      return groupDetails[groupId]
    }

    try {
      const group = await groupService.getGroupById(groupId)
      const transformed = transformGroupDetails(group)
      // Cache it
      setGroupDetails(prev => ({
        ...prev,
        [groupId]: transformed,
      }))
      return transformed
    } catch (err) {
      console.error('Failed to get group:', err)
      throw err
    }
  }, [groupDetails, transformGroupDetails])

  /**
   * Add members to a group
   * @param {number} groupId - Group ID
   * @param {Array<number>} memberIds - Array of friend IDs to add
   * @returns {Promise<Object>} Updated group
   */
  const addMembers = useCallback(async (groupId, memberIds) => {
    try {
      const group = await groupService.addMembersToGroup(groupId, memberIds)
      const transformed = transformGroupDetails(group)
      // Update cache
      setGroupDetails(prev => ({
        ...prev,
        [groupId]: transformed,
      }))
      // Update groups list
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, participantCount: transformed.participants.length }
          : g
      ))
      return transformed
    } catch (err) {
      console.error('Failed to add members:', err)
      throw err
    }
  }, [transformGroupDetails])

  /**
   * Remove a member from a group
   * @param {number} groupId - Group ID
   * @param {number} memberId - Member user ID to remove
   * @returns {Promise<Object>} Updated group
   */
  const removeMember = useCallback(async (groupId, memberId) => {
    try {
      const group = await groupService.removeMemberFromGroup(groupId, memberId)
      const transformed = transformGroupDetails(group)
      // Update cache
      setGroupDetails(prev => ({
        ...prev,
        [groupId]: transformed,
      }))
      // Update groups list
      setGroups(prev => prev.map(g => 
        g.id === groupId 
          ? { ...g, participantCount: transformed.participants.length }
          : g
      ))
      return transformed
    } catch (err) {
      console.error('Failed to remove member:', err)
      throw err
    }
  }, [transformGroupDetails])

  /**
   * Exit a group
   * @param {number} groupId - Group ID
   * @returns {Promise<boolean>} Success status
   */
  const exitGroup = useCallback(async (groupId) => {
    try {
      await groupService.exitGroup(groupId)
      // Remove from groups list
      setGroups(prev => prev.filter(g => g.id !== groupId))
      // Remove from cache
      setGroupDetails(prev => {
        const updated = { ...prev }
        delete updated[groupId]
        return updated
      })
      return true
    } catch (err) {
      console.error('Failed to exit group:', err)
      throw err
    }
  }, [])

  /**
   * Search friends for adding to group
   * @param {number} groupId - Group ID
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of friends matching query
   */
  const searchFriendsForGroup = useCallback(async (groupId, query) => {
    if (!query || query.trim().length === 0) {
      return []
    }
    try {
      const results = await groupService.searchFriendsForGroup(groupId, query.trim())
      // Transform to UI format
      return results.map(f => ({
        id: f.id,
        name: f.name,
        email: f.email,
        initials: getInitials(f.name),
        color: getUserColor(f.id),
      }))
    } catch (err) {
      console.error('Failed to search friends:', err)
      throw err
    }
  }, [])

  return {
    groups,
    loading,
    error,
    createGroup,
    refreshGroups,
    getGroupById,
    addMembers,
    removeMember,
    exitGroup,
    searchFriendsForGroup,
    formatLKR,
  }
}
