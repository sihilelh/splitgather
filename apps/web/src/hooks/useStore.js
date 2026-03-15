import { useCallback, useMemo } from 'react'
import { useAuth } from './useAuth.jsx'
import { useFriends } from './useFriends.jsx'
import { useGroups } from './useGroups.jsx'
import { useRecords } from './useRecords.jsx'
import { useBalances } from './useBalances.jsx'
import { transformExpenseToRecord } from '../utils/recordTransform.js'
import * as settlementService from '../api/settlementService.js'

/**
 * Get user initials from name
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
 */
function getUserColor(id) {
  const colors = ['#1FD888', '#ff4b5a', '#ffb938', '#4dabf7', '#a78bfa', '#f97316', '#ec4899', '#06b6d4']
  const numId = typeof id === 'string' ? parseInt(id.replace(/[^0-9]/g, ''), 10) || 0 : id
  return colors[numId % colors.length]
}

export function useStore() {
  const { user } = useAuth()
  const { friends: friendsData, refreshFriends } = useFriends()
  const { groups: groupsData, refreshGroups } = useGroups()
  const { expenses, createRecord, refreshRecords } = useRecords()
  const { totalOwed, totalOwe, netBalance, refreshBalances } = useBalances()

  // Transform friends to include UI-friendly fields
  const friends = useMemo(() => {
    return friendsData.map(f => ({
      id: String(f.friendId || f.id),
      name: f.friend?.name || f.name || 'Unknown',
      email: f.friend?.email || f.email || '',
      initials: getInitials(f.friend?.name || f.name || ''),
      color: getUserColor(f.friendId || f.id),
      balance: f.balance || 0,
    }))
  }, [friendsData])

  // Transform groups to include UI-friendly fields
  const groups = useMemo(() => {
    return groupsData.map(g => ({
      id: String(g.id),
      name: g.name || '',
      description: g.description || '',
      icon: g.icon || '🏠',
      color: g.color || getUserColor(g.id),
      members: g.participants?.map(p => String(p.userId)) || [],
      balance: g.userBalance || 0,
      participantCount: g.participantCount || 0,
    }))
  }, [groupsData])

  // Transform current user to include UI-friendly fields
  const currentUser = useMemo(() => {
    if (!user) return null
    return {
      id: String(user.id),
      name: user.name || '',
      email: user.email || '',
      initials: getInitials(user.name || ''),
      color: getUserColor(user.id),
    }
  }, [user])

  const addExpense = useCallback(async (exp) => {
    try {
      // Transform expense format to API record format
      const recordData = transformExpenseToRecord(exp, user?.id)
      
      // Create record via API
      const newRecord = await createRecord(recordData)
      
      // Refresh related data
      await Promise.all([
        refreshRecords(),
        refreshFriends(),
        refreshGroups(),
        refreshBalances(),
      ])
      
      // Transform back to expense format for return
      const transformedExpense = {
        id: String(newRecord.id),
        title: newRecord.description || exp.title || exp.description,
        amount: newRecord.amount || exp.amount,
        paidBy: String(newRecord.paidBy),
        splitWith: (newRecord.splits || []).map(s => String(s.userId)).filter(id => id !== String(newRecord.paidBy)),
        date: newRecord.expenseDate ? new Date(newRecord.expenseDate).toISOString().slice(0, 10) : (exp.date || new Date().toISOString().slice(0, 10)),
        category: newRecord.category || exp.category || 'other',
        groupId: newRecord.groupId ? String(newRecord.groupId) : null,
      }
      
      return transformedExpense
    } catch (err) {
      console.error('Failed to add expense:', err)
      throw err
    }
  }, [user, createRecord, refreshRecords, refreshFriends, refreshGroups, refreshBalances])

  const settleWithFriend = useCallback(async (friendId, paymentDetails = {}) => {
    try {
      if (!user) throw new Error('User not authenticated')
      
      // Find friend to get their balance
      const friend = friends.find(f => String(f.id) === String(friendId))
      if (!friend) throw new Error('Friend not found')
      
      // Determine payer and receiver based on balance
      const friendIdNum = typeof friendId === 'string' 
        ? parseInt(friendId.replace(/[^0-9]/g, ''), 10) 
        : friendId
      const userIdNum = user.id
      
      let payerId, receiverId, amount
      
      if (friend.balance > 0) {
        // Friend owes you - they pay you
        payerId = friendIdNum
        receiverId = userIdNum
        amount = Math.abs(friend.balance)
      } else if (friend.balance < 0) {
        // You owe friend - you pay them
        payerId = userIdNum
        receiverId = friendIdNum
        amount = Math.abs(friend.balance)
      } else {
        // Already settled
        return
      }
      
      // Use provided amount if available (for partial settlements)
      if (paymentDetails.amount) {
        amount = Math.min(amount, paymentDetails.amount)
      }
      
      // Create settlement via API
      await settlementService.createSettlement({
        payerId,
        receiverId,
        amount,
        note: paymentDetails.note || paymentDetails.method ? `Paid via ${paymentDetails.method}` : null,
      })
      
      // Refresh related data
      await Promise.all([
        refreshFriends(),
        refreshBalances(),
        refreshRecords(),
      ])
    } catch (err) {
      console.error('Failed to settle with friend:', err)
      throw err
    }
  }, [user, friends, refreshFriends, refreshBalances, refreshRecords])

  const addFriend = useCallback(async (friend) => {
    // This is handled by useFriends hook's addFriend method
    // Keeping for backward compatibility but should use useFriends directly
    await refreshFriends()
  }, [refreshFriends])

  const addGroup = useCallback(async (group) => {
    // This is handled by useGroups hook's createGroup method
    // Keeping for backward compatibility but should use useGroups directly
    await refreshGroups()
  }, [refreshGroups])

  return {
    currentUser,
    friends,
    groups,
    expenses,
    addExpense,
    settleWithFriend,
    addFriend,
    addGroup,
    totalOwed,
    totalOwe,
    netBalance,
  }
}
