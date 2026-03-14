import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, SectionLabel, Avatar, Button, EmptyState, BottomSheet, Input } from '../components/UI.jsx'
import BackButton from '../components/BackButton.jsx'
import BalanceHeroCard from '../components/BalanceHeroCard.jsx'
import { useGroups } from '../hooks/useGroups.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'

export default function GroupDetailScreen() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getGroupById, addMembers, removeMember, exitGroup, searchFriendsForGroup, formatLKR } = useGroups()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddMembers, setShowAddMembers] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [friendSearchQuery, setFriendSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [selectedFriends, setSelectedFriends] = useState([])

  // Load group details
  useEffect(() => {
    if (groupId) {
      loadGroup()
    }
  }, [groupId])

  const loadGroup = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const groupData = await getGroupById(parseInt(groupId, 10))
      setGroup(groupData)
    } catch (err) {
      setError(err.message || 'Failed to load group')
      console.error('Failed to load group:', err)
    } finally {
      setLoading(false)
    }
  }, [groupId, getGroupById])

  // Debounced friend search for adding members
  useEffect(() => {
    if (showAddMembers && friendSearchQuery.trim() && group) {
      setSearching(true)
      const timer = setTimeout(async () => {
        try {
          const results = await searchFriendsForGroup(group.id, friendSearchQuery)
          setSearchResults(results)
        } catch (err) {
          console.error('Search failed:', err)
          setSearchResults([])
        } finally {
          setSearching(false)
        }
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
    }
  }, [friendSearchQuery, showAddMembers, group, searchFriendsForGroup])

  const handleExitGroup = useCallback(async () => {
    if (!window.confirm('Are you sure you want to exit this group?')) {
      return
    }
    try {
      await exitGroup(group.id)
      navigate('/groups')
    } catch (err) {
      console.error('Failed to exit group:', err)
      alert(err.message || 'Failed to exit group')
    }
  }, [group, exitGroup, navigate])

  const handleRemoveMember = useCallback(async (memberId) => {
    if (!window.confirm('Remove this member from the group?')) {
      return
    }
    try {
      await removeMember(group.id, memberId)
      await loadGroup() // Refresh group data
      setSelectedMember(null)
    } catch (err) {
      console.error('Failed to remove member:', err)
      alert(err.message || 'Failed to remove member')
    }
  }, [group, removeMember, loadGroup])

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    )
  }

  const handleAddMembers = useCallback(async () => {
    if (selectedFriends.length === 0) {
      alert('Please select at least one friend to add')
      return
    }
    try {
      await addMembers(group.id, selectedFriends)
      await loadGroup() // Refresh group data
      setShowAddMembers(false)
      setSelectedFriends([])
      setFriendSearchQuery('')
    } catch (err) {
      console.error('Failed to add members:', err)
      alert(err.message || 'Failed to add members')
    }
  }, [group, selectedFriends, addMembers, loadGroup])

  if (loading) {
    return <LoadingState message="Loading group..." />
  }

  if (error || !group) {
    return <ErrorState message={error || 'Group not found'} onRetry={loadGroup} />
  }

  // Get current user's participant info
  const currentUserParticipant = group.participants?.find(p => p.userId === user?.id) || null
  const isCurrentUserInGroup = currentUserParticipant !== null

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:90, position:'relative', zIndex:1 }}>
      <div className="a1" style={{ padding:'52px 20px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <BackButton onClick={()=>navigate('/groups')} />
          <Button
            variant="danger"
            size="sm"
            onClick={handleExitGroup}
            style={{ padding:'8px 16px', fontSize:13 }}
          >
            Exit Group
          </Button>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <div style={{
            fontSize:42, width:60, height:60,
            display:'flex', alignItems:'center', justifyContent:'center',
            background:`linear-gradient(135deg,${group.color}30,${group.color}12)`,
            borderRadius:18, border:`2px solid ${group.color}40`,
            boxShadow:`0 6px 20px ${group.color}25`,
            animation:'float 4s ease-in-out infinite',
          }}>{group.icon}</div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:800, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:3 }}>{group.name}</h1>
            <div style={{ fontSize:13, color:'var(--text3)' }}>{group.description || 'No description'}</div>
          </div>
        </div>
      </div>

      <div style={{ padding:'0 16px' }}>
        {/* Balance card */}
        <BalanceHeroCard
          title="Your Balance"
          balance={group.userBalance || 0}
          color={group.color}
          style={{ padding:'20px', marginBottom:14 }}
        />

        {/* Members */}
        <SectionLabel>
          {group.participants?.length || 0} Members
          <Button
            variant="ghost"
            size="sm"
            onClick={()=>setShowAddMembers(true)}
            style={{ padding:'6px 12px', fontSize:12 }}
          >
            + Add Members
          </Button>
        </SectionLabel>
        <Card>
          <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
            {group.participants?.map(member => {
              const isCurrentUser = member.userId === user?.id
              return (
                <div
                  key={member.userId}
                  onClick={() => !isCurrentUser && setSelectedMember(selectedMember === member.userId ? null : member.userId)}
                  style={{
                    display:'flex',
                    flexDirection:'column',
                    alignItems:'center',
                    gap:5,
                    minWidth:52,
                    cursor: isCurrentUser ? 'default' : 'pointer',
                    padding: selectedMember === member.userId ? 8 : 0,
                    borderRadius: selectedMember === member.userId ? 12 : 0,
                    background: selectedMember === member.userId ? 'rgba(31,216,136,0.08)' : 'transparent',
                    transition: 'all .15s',
                  }}
                >
                  <Avatar initials={member.initials} color={member.color} size={44}/>
                  <span style={{ fontSize:11, color:'var(--text2)', textAlign:'center', fontWeight:600 }}>
                    {isCurrentUser ? 'You' : member.name.split(' ')[0]}
                  </span>
                  {member.owsAmount !== 0 && (
                    <span style={{
                      fontSize:10,
                      color: member.owsAmount > 0 ? 'var(--negative)' : 'var(--positive)',
                      fontWeight:700,
                    }}>
                      {member.owsAmount > 0 ? '-' : '+'}{formatLKR(Math.abs(member.owsAmount))}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Remove member action */}
        {selectedMember && selectedMember !== user?.id && (
          <Card style={{ marginTop:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.20)' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>
                  Remove from group?
                </div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>
                  This will remove {group.participants?.find(p => p.userId === selectedMember)?.name} from the group
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleRemoveMember(selectedMember)}
                style={{ padding:'8px 16px', fontSize:12 }}
              >
                Remove
              </Button>
            </div>
          </Card>
        )}

        {/* Records section - placeholder */}
        <SectionLabel>Records · 0</SectionLabel>
        <EmptyState emoji="💸" title="No records yet" subtitle="Records will be developed later"/>
      </div>

      {/* Add Members Sheet */}
      <BottomSheet open={showAddMembers} onClose={()=>{
        setShowAddMembers(false)
        setSelectedFriends([])
        setFriendSearchQuery('')
      }} title="Add Members">
        <Input 
          label="Search Friends" 
          placeholder="Type to search friends..."
          value={friendSearchQuery} 
          onChange={e=>setFriendSearchQuery(e.target.value)}
        />

        {searching && (
          <div style={{ textAlign:'center', padding:20, color:'var(--text3)', fontSize:13 }}>
            Searching...
          </div>
        )}

        {!searching && friendSearchQuery.trim() && searchResults.length === 0 && (
          <div style={{ textAlign:'center', padding:20, color:'var(--text3)', fontSize:13 }}>
            No friends found
          </div>
        )}

        {!searching && friendSearchQuery.trim() && searchResults.length > 0 && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', marginBottom:8, textTransform:'uppercase', letterSpacing:'1px' }}>
              Select Friends ({selectedFriends.length} selected)
            </div>
            <div style={{ maxHeight:200, overflowY:'auto' }}>
              {searchResults.map(friend => {
                const isSelected = selectedFriends.includes(friend.id)
                return (
                  <button
                    key={friend.id}
                    onClick={()=>toggleFriendSelection(friend.id)}
                    style={{
                      width:'100%',
                      padding:'12px 14px',
                      marginBottom:8,
                      background: isSelected 
                        ? 'linear-gradient(135deg,rgba(31,216,136,0.18),rgba(31,216,136,0.12))'
                        : 'var(--glass-bg)',
                      border:`1.5px solid ${isSelected ? '#1FD888' : 'var(--glass-border)'}`,
                      borderRadius:12,
                      cursor:'pointer',
                      display:'flex',
                      alignItems:'center',
                      gap:12,
                      transition:'all .15s',
                    }}
                  >
                    <div style={{
                      width:36, height:36, borderRadius:'50%',
                      background:`linear-gradient(135deg, ${friend.color}33, ${friend.color}18)`,
                      border:`2px solid ${friend.color}55`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, fontWeight:800, color:friend.color,
                    }}>
                      {friend.initials}
                    </div>
                    <div style={{ flex:1, textAlign:'left' }}>
                      <div style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{friend.name}</div>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize:18 }}>✓</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {!friendSearchQuery.trim() && (
          <div style={{ textAlign:'center', padding:20, color:'var(--text3)', fontSize:13 }}>
            Start typing to search for friends
          </div>
        )}

        <Button
          onClick={handleAddMembers}
          disabled={selectedFriends.length === 0}
        >
          Add {selectedFriends.length > 0 ? `${selectedFriends.length} ` : ''}Member{selectedFriends.length !== 1 ? 's' : ''}
        </Button>
      </BottomSheet>
    </div>
  )
}
