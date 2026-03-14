import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, SectionLabel, Button, EmptyState, BottomSheet, Input } from '../components/UI.jsx'
import GroupCard from '../components/GroupCard.jsx'
import { useGroups } from '../hooks/useGroups.jsx'
import { useFriends } from '../hooks/useFriends.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'

const EMOJIS = ['🏠','📚','☕','🎮','🏋️','🎵','🛒','✈️','🍕','🎉','🎓','💻']

export default function GroupsScreen() {
  const navigate = useNavigate()
  const { groups, loading, error, createGroup, refreshGroups } = useGroups()
  const { friends } = useFriends()
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🏠')
  const [step, setStep] = useState(1) // 1: name/icon, 2: select friends
  const [selectedFriends, setSelectedFriends] = useState([])
  const [friendSearchQuery, setFriendSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  // Debounced friend search
  useEffect(() => {
    if (step === 2 && friendSearchQuery.trim()) {
      setSearching(true)
      const timer = setTimeout(() => {
        // Filter friends by name
        const query = friendSearchQuery.toLowerCase()
        const filtered = friends
          .filter(f => f.name.toLowerCase().includes(query))
          .slice(0, 10)
        setSearchResults(filtered)
        setSearching(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setSearchResults([])
    }
  }, [friendSearchQuery, step, friends])

  const handleNameKeyPress = (e) => {
    if (e.key === 'Enter' && newName.trim()) {
      setStep(2)
    }
  }

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    )
  }

  const handleCreateGroup = useCallback(async () => {
    try {
      const created = await createGroup({
        name: newName.trim(),
        icon: newEmoji,
        description: '',
        memberIds: selectedFriends,
      })
      // Reset form
      setNewName('')
      setNewEmoji('🏠')
      setStep(1)
      setSelectedFriends([])
      setFriendSearchQuery('')
      setShowCreate(false)
      // Navigate to group detail
      navigate(`/groups/${created.id}`)
    } catch (err) {
      console.error('Failed to create group:', err)
      alert(err.message || 'Failed to create group')
    }
  }, [newName, newEmoji, selectedFriends, createGroup, navigate])

  const handleClose = () => {
    setShowCreate(false)
    setStep(1)
    setNewName('')
    setNewEmoji('🏠')
    setSelectedFriends([])
    setFriendSearchQuery('')
  }

  if (loading && groups.length === 0) {
    return <LoadingState />
  }

  if (error && groups.length === 0) {
    return <ErrorState message={error} onRetry={refreshGroups} />
  }

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:90, position:'relative', zIndex:1 }}>
      <div className="a1" style={{ padding:'52px 20px 16px' }}>
        <h1 style={{ fontSize:28, fontWeight:800, color:'var(--text)', letterSpacing:'-0.03em' }}>Groups</h1>
      </div>

      <div style={{ padding:'0 16px' }}>
        <div className="a2">
          <Button variant="ghost" onClick={()=>setShowCreate(true)} style={{ marginBottom:14 }}>
            ＋ Create New Group
          </Button>
        </div>

        <SectionLabel>Your Groups · {groups.length}</SectionLabel>

        {groups.length===0
          ? <EmptyState emoji="🏘" title="No groups yet" subtitle="Create a group to split expenses together"/>
          : groups.map((g)=>(
            <GroupCard
              key={g.id}
              group={g}
              expenseCount={0}
              onClick={()=>navigate(`/groups/${g.id}`)}
            />
          ))
        }
      </div>

      {/* Create Group Sheet */}
      <BottomSheet open={showCreate} onClose={handleClose} title="Create Group">
        {step === 1 ? (
          <>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
              {EMOJIS.map(e=>(
                <button key={e} onClick={()=>setNewEmoji(e)} style={{
                  fontSize:22, width:46, height:46, borderRadius:13,
                  border:`2px solid ${newEmoji===e?'#1FD888':'rgba(31,216,136,0.22)'}`,
                  background: newEmoji===e
                    ? 'linear-gradient(135deg,rgba(31,216,136,0.18),rgba(31,216,136,0.12))'
                    : 'rgba(255,255,255,0.45)',
                  backdropFilter:'blur(8px)',
                  cursor:'pointer',
                  transition:'all .15s',
                  boxShadow: newEmoji===e ? '0 3px 10px rgba(31,216,136,0.25)' : 'none',
                }}>{e}</button>
              ))}
            </div>
            <Input 
              label="Group Name" 
              placeholder="e.g. CS Dorm Floor 3"
              value={newName} 
              onChange={e=>setNewName(e.target.value)}
              onKeyPress={handleNameKeyPress}
            />
            <div style={{ fontSize:12, color:'var(--text3)', marginTop:-8, marginBottom:12 }}>
              Press Enter to continue
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom:16, padding:12, background:'rgba(31,216,136,0.08)', borderRadius:12, border:'1px solid rgba(31,216,136,0.20)' }}>
              <div style={{ fontSize:11, color:'var(--text3)', marginBottom:4 }}>Group</div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:20 }}>{newEmoji}</span>
                <span style={{ fontSize:15, fontWeight:700, color:'var(--text)' }}>{newName}</span>
              </div>
            </div>

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

            <div style={{ display:'flex', gap:10 }}>
              <Button
                variant="secondary"
                onClick={()=>setStep(1)}
                style={{ flex:1 }}
              >
                Back
              </Button>
              <Button
                onClick={handleCreateGroup}
                disabled={selectedFriends.length === 0 && friendSearchQuery.trim() === ''}
                style={{ flex:1 }}
              >
                Create Group
              </Button>
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  )
}
