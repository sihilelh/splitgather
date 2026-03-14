import React, { useState, useEffect, useCallback } from 'react'
import { Card, SectionLabel, Avatar, BalanceBadge, Button, EmptyState, BottomSheet, Input } from '../components/UI.jsx'
import { useFriends } from '../hooks/useFriends.jsx'
import { getInitials, getColorForUser } from '../utils/helpers.js'
import BackButton from '../components/BackButton.jsx'
import SearchInput from '../components/SearchInput.jsx'
import FriendRow from '../components/FriendRow.jsx'
import ExpenseCard from '../components/ExpenseCard.jsx'
import BalanceHeroCard from '../components/BalanceHeroCard.jsx'
import CurrencyInput from '../components/CurrencyInput.jsx'
import PaymentMethodSelector from '../components/PaymentMethodSelector.jsx'
import LoadingState from '../components/LoadingState.jsx'
import ErrorState from '../components/ErrorState.jsx'

export default function FriendsScreen({ expenses, onSettle }) {
  const { friends, loading, error, searchUsers: searchUsersAPI, addFriend: addFriendAPI, getFriendsByCategory } = useFriends()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [showSettle, setShowSettle] = useState(false)
  const [settleAmount, setSettleAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  // Transform API friends to UI format
  const transformedFriends = friends.map(f => ({
    id: f.friendId,
    name: f.friend.name,
    email: f.friend.email,
    balance: f.balance,
    initials: getInitials(f.friend.name),
    color: getColorForUser(f.friendId),
  }))

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowMore(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setSearching(true)
      try {
        const results = await searchUsersAPI(searchQuery)
        // Sort alphabetically by name
        const sorted = results.sort((a, b) => a.name.localeCompare(b.name))
        // Show max 10 initially
        setSearchResults(sorted)
        setShowMore(sorted.length > 10)
      } catch (err) {
        console.error('Search failed:', err)
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchUsersAPI])

  const handleAddFriendQuick = async (user) => {
    try {
      await addFriendAPI(user.id)
      setSearchQuery('')
      setSearchResults([])
      setShowAdd(false)
      setShowMore(false)
    } catch (err) {
      console.error('Failed to add friend:', err)
      alert(err.message || 'Failed to add friend')
    }
  }

  const sf = selected ? transformedFriends.find(f => f.id === selected) : null
  const friendExps = selected ? expenses.filter(e => e.paidBy === selected || e.splitWith?.includes(selected)) : []

  if (loading && friends.length === 0) {
    return <LoadingState message="Loading friends..." />
  }

  if (error && friends.length === 0) {
    return <ErrorState message={error} />
  }

  if (selected && sf) {
    return (
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90, position: 'relative', zIndex: 1 }}>
        <div className="a1" style={{ padding: '52px 20px 16px' }}>
          <BackButton onClick={() => setSelected(null)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar initials={sf.initials} color={sf.color} size={58} />
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 5 }}>{sf.name}</h1>
              <BalanceBadge value={sf.balance} />
            </div>
          </div>
        </div>

        <div style={{ padding: '0 16px' }}>
          {sf.balance !== 0 && (
            <BalanceHeroCard
              title={sf.balance > 0 ? `${sf.name} owes you` : `You owe ${sf.name}`}
              balance={sf.balance}
              color={sf.balance > 0 ? '#1FD888' : '#d23214'}
              onAction={() => { setSettleAmount(Math.abs(sf.balance).toString()); setShowSettle(true) }}
              actionLabel="Settle Up ✓"
              style={{ padding: '18px 18px', marginBottom: 12 }}
            />
          )}
          {sf.balance === 0 && (
            <div className="a2" style={{
              textAlign: 'center', padding: '12px', color: 'var(--positive)',
              fontSize: 14, fontWeight: 700, marginBottom: 12,
              background: 'rgba(31,216,136,0.10)', borderRadius: 'var(--r-md)',
              border: '1px solid rgba(31,216,136,0.20)'
            }}>
              🎉 All settled up!
            </div>
          )}

          <SectionLabel>Shared Expenses · {friendExps.length}</SectionLabel>
          {friendExps.length === 0
            ? <EmptyState emoji="🤝" title="No shared expenses" subtitle="Add an expense to split with this friend" />
            : friendExps.map(e => (
              <ExpenseCard
                key={e.id}
                expense={e}
                friends={transformedFriends}
                currentUserId="u1"
                showBalance={true}
              />
            ))
          }
        </div>
      </div>
    )
  }

  const categories = getFriendsByCategory()
  const oweYou = categories.oweYou.map(f => ({
    id: f.friendId,
    name: f.friend.name,
    balance: f.balance,
    initials: getInitials(f.friend.name),
    color: getColorForUser(f.friendId),
  }))
  const youOwe = categories.youOwe.map(f => ({
    id: f.friendId,
    name: f.friend.name,
    balance: f.balance,
    initials: getInitials(f.friend.name),
    color: getColorForUser(f.friendId),
  }))
  const settled = categories.settled.map(f => ({
    id: f.friendId,
    name: f.friend.name,
    balance: f.balance,
    initials: getInitials(f.friend.name),
    color: getColorForUser(f.friendId),
  }))

  const displayedSearchResults = showMore ? searchResults : searchResults.slice(0, 10)

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 90, position: 'relative', zIndex: 1 }}>
      <div className="a1" style={{ padding: '52px 20px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>Friends</h1>
          <button onClick={() => setShowAdd(true)} style={{
            background: 'linear-gradient(135deg,rgba(31,216,136,0.18),rgba(31,216,136,0.12))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(31,216,136,0.30)',
            borderRadius: 12, color: 'var(--accent)',
            padding: '8px 14px', fontSize: 13, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'var(--font-body)',
            boxShadow: '0 3px 10px rgba(31,216,136,0.20)',
            transition: 'transform .12s',
          }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          >+ Add</button>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div className="a2">
          <SearchInput
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍  Search friends…"
          />
        </div>

        {oweYou.length > 0 && (<>
          <SectionLabel className="a3">Owe You · LKR {oweYou.reduce((s, f) => s + Math.abs(f.balance), 0).toFixed(2)}</SectionLabel>
          {oweYou.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(f => (
            <Card key={f.id} className="a4" onClick={() => setSelected(f.id)}>
              <FriendRow friend={f} />
            </Card>
          ))}
        </>)}

        {youOwe.length > 0 && (<>
          <SectionLabel>You Owe · LKR {youOwe.reduce((s, f) => s + Math.abs(f.balance), 0).toFixed(2)}</SectionLabel>
          {youOwe.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(f => (
            <Card key={f.id} onClick={() => setSelected(f.id)}>
              <FriendRow friend={f} />
            </Card>
          ))}
        </>)}

        {settled.length > 0 && (<>
          <SectionLabel>Settled Up ✓</SectionLabel>
          {settled.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).map(f => (
            <Card key={f.id} onClick={() => setSelected(f.id)}>
              <FriendRow friend={f} />
            </Card>
          ))}
        </>)}

        {transformedFriends.filter(f => f.name.toLowerCase().includes(search.toLowerCase())).length === 0 && search && (
          <EmptyState emoji="🔍" title="No results" subtitle={`No friend named "${search}"`} />
        )}

        {transformedFriends.length === 0 && !loading && (
          <EmptyState emoji="👥" title="No friends yet" subtitle="Add your first friend to get started" />
        )}
      </div>

      <BottomSheet open={showAdd} onClose={() => {
        setShowAdd(false); setSearchQuery(''); setSearchResults([]); setShowMore(false);
      }} title="Add Friend">
        <Input
          label="Search for a friend"
          placeholder="By name or email"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          autoFocus
        />

        {searching && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text2)' }}>
            Searching...
          </div>
        )}

        {displayedSearchResults.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
              Search Results {searchResults.length > 10 && !showMore && `(showing 10 of ${searchResults.length})`}
            </div>
            {displayedSearchResults.map(user => (
              <div
                key={user.id}
                onClick={() => handleAddFriendQuick(user)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  border: '1.5px solid rgba(31,216,136,0.30)',
                  background: 'linear-gradient(135deg, rgba(31,216,136,0.15), rgba(31,216,136,0.10))',
                  marginBottom: 8,
                  cursor: 'pointer',
                  transition: 'all .18s',
                }}
              >
                <Avatar initials={getInitials(user.name)} color={getColorForUser(user.id)} size={38} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                    {user.email}
                  </div>
                </div>
                <div style={{ fontSize: 18, color: 'var(--accent)' }}>+</div>
              </div>
            ))}
            {searchResults.length > 10 && !showMore && (
              <Button
                variant="secondary"
                onClick={() => setShowMore(true)}
                style={{ width: '100%', marginTop: 8 }}
              >
                Show More ({searchResults.length - 10} more)
              </Button>
            )}
          </div>
        )}

        {searchQuery && searchResults.length === 0 && !searching && (
          <div style={{
            textAlign: 'center', padding: '20px 0',
            color: 'var(--text3)', fontSize: 13
          }}>
            No results found
          </div>
        )}

        {!searchQuery && searchResults.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            color: 'var(--text3)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 13, marginBottom: 16 }}>
              Search by name or email
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Settle Up Modal */}
      <BottomSheet
        open={showSettle}
        onClose={() => { setShowSettle(false); setSettleAmount(''); }}
        title="Settle Up"
      >
        {sf && (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '13px 16px',
              background: 'linear-gradient(135deg, rgba(31,216,136,0.15), rgba(31,216,136,0.10))',
              border: '1.5px solid rgba(31,216,136,0.30)',
              borderRadius: 'var(--r-md)',
              marginBottom: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            }}>
              <span style={{ color: 'var(--text2)', fontSize: 13, fontWeight: 600 }}>
                Total balance: {sf.balance > 0 ? 'owes you' : 'you owe'}
              </span>
              <span style={{
                fontSize: 22,
                fontWeight: 800,
                color: 'var(--accent)',
                letterSpacing: '-0.02em'
              }}>
                LKR {Math.abs(sf.balance).toFixed(2)}
              </span>
            </div>

            <CurrencyInput
              label="Payment Amount (LKR)"
              value={settleAmount}
              onChange={e => setSettleAmount(e.target.value)}
              placeholder="0.00"
            />
            <button
              onClick={() => setSettleAmount(Math.abs(sf.balance).toString())}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0',
                fontFamily: 'var(--font-body)',
                marginTop: -8,
                marginBottom: 16,
              }}
            >
              Pay full amount (LKR {Math.abs(sf.balance).toFixed(2)})
            </button>

            <PaymentMethodSelector
              selected={paymentMethod}
              onSelect={setPaymentMethod}
            />

            {settleAmount && parseFloat(settleAmount) > 0 && (
              <div style={{
                background: 'rgba(31,216,136,0.08)',
                border: '1.5px solid rgba(31,216,136,0.20)',
                borderRadius: 'var(--r-md)',
                padding: '12px 14px',
                marginBottom: 16,
                fontSize: 12,
                color: 'var(--accent)',
                fontWeight: 600,
              }}>
                {Math.abs(sf.balance) - parseFloat(settleAmount) > 0.01
                  ? `Outstanding: LKR ${(Math.abs(sf.balance) - parseFloat(settleAmount)).toFixed(2)}`
                  : parseFloat(settleAmount) - Math.abs(sf.balance) > 0.01
                    ? `Overpayment: LKR ${(parseFloat(settleAmount) - Math.abs(sf.balance)).toFixed(2)}`
                    : 'Fully settled!'}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowSettle(false)
                  setSettleAmount('')
                }}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (settleAmount && parseFloat(settleAmount) > 0) {
                    onSettle(sf.id, {
                      amount: parseFloat(settleAmount),
                      method: paymentMethod,
                    })
                    setSelected(null)
                    setShowSettle(false)
                    setSettleAmount('')
                  }
                }}
                disabled={!settleAmount || parseFloat(settleAmount) <= 0}
                style={{ flex: 1 }}
              >
                Confirm Payment
              </Button>
            </div>
          </>
        )}
      </BottomSheet>
    </div>
  )
}

