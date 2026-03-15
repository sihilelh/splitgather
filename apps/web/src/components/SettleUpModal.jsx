import React, { useState, useMemo } from 'react'
import { BottomSheet, Button, Avatar, Input } from './UI.jsx'
import CurrencyInput from './CurrencyInput.jsx'

export default function SettleUpModal({ open, onClose, friends, currentUserId, onSettle }) {
  const [selectedFriend, setSelectedFriend] = useState(null)
  const [settleMode, setSettleMode] = useState('full') // 'full' or 'custom'
  const [customAmount, setCustomAmount] = useState('')
  const [note, setNote] = useState('')

  const { oweYou, youOwe } = useMemo(() => {
    const oweYouList = friends.filter(f => f.balance < 0)
    const youOweList = friends.filter(f => f.balance > 0)
    return {
      oweYou: oweYouList.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)),
      youOwe: youOweList.sort((a, b) => b.balance - a.balance),
    }
  }, [friends])

  const handleClose = () => {
    setSelectedFriend(null)
    setSettleMode('full')
    setCustomAmount('')
    setNote('')
    onClose()
  }

  const handleFriendClick = (friend) => {
    setSelectedFriend(friend)
    setSettleMode('full')
    setCustomAmount('')
    setNote('')
  }

  const handleSettle = () => {
    if (!selectedFriend) return

    const balance = Math.abs(selectedFriend.balance)
    const isOweYou = selectedFriend.balance < 0

    let amount
    if (settleMode === 'full') {
      amount = balance
    } else {
      amount = parseFloat(customAmount) || 0
      if (amount <= 0 || amount > balance) {
        return // Invalid amount
      }
    }

    const settlementData = {
      payerId: isOweYou ? selectedFriend.friendId : currentUserId,
      receiverId: isOweYou ? currentUserId : selectedFriend.friendId,
      amount,
      note: note.trim() || null,
    }

    onSettle(settlementData)
    handleClose()
  }

  const getSettlementAmount = () => {
    if (!selectedFriend) return 0
    if (settleMode === 'full') {
      return Math.abs(selectedFriend.balance)
    }
    return parseFloat(customAmount) || 0
  }

  const canSettle = () => {
    if (!selectedFriend) return false
    const balance = Math.abs(selectedFriend.balance)
    if (settleMode === 'full') return true
    const amount = parseFloat(customAmount) || 0
    return amount > 0 && amount <= balance
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={selectedFriend ? 'Settle Up' : 'Settle Up'}>
      {!selectedFriend ? (
        <>
          {/* Owe You Section */}
          {oweYou.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text3)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: 10,
              }}>
                Owe You 💚
              </label>
              {oweYou.map(friend => (
                <div
                  key={friend.friendId}
                  onClick={() => handleFriendClick(friend)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 'var(--r-md)',
                    border: '1.5px solid rgba(31,216,136,0.30)',
                    background: 'linear-gradient(135deg, rgba(31,216,136,0.15), rgba(31,216,136,0.08))',
                    marginBottom: 8,
                    cursor: 'pointer',
                    transition: 'all .18s',
                    boxShadow: '0 4px 16px rgba(31,216,136,0.20)',
                  }}
                >
                  <Avatar initials={friend.friend?.name?.split(' ').map(n => n[0]).join('') || '?'} color="#1FD888" size={38} />
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                    {friend.friend?.name || 'Unknown'}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--positive)' }}>
                      +LKR {Math.abs(friend.balance).toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>Tap to settle</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* You Owe Section */}
          {youOwe.length > 0 && (
            <div>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text3)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: 10,
              }}>
                You Owe 🔴
              </label>
              {youOwe.map(friend => (
                <div
                  key={friend.friendId}
                  onClick={() => handleFriendClick(friend)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 'var(--r-md)',
                    border: '1.5px solid rgba(210,50,20,0.30)',
                    background: 'linear-gradient(135deg, rgba(210,50,20,0.15), rgba(210,50,20,0.08))',
                    marginBottom: 8,
                    cursor: 'pointer',
                    transition: 'all .18s',
                    boxShadow: '0 4px 16px rgba(210,50,20,0.20)',
                  }}
                >
                  <Avatar initials={friend.friend?.name?.split(' ').map(n => n[0]).join('') || '?'} color="#d23214" size={38} />
                  <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                    {friend.friend?.name || 'Unknown'}
                  </span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--negative)' }}>
                      -LKR {friend.balance.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>Tap to settle</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {oweYou.length === 0 && youOwe.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text3)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text2)', marginBottom: 6 }}>
                All settled up!
              </div>
              <div style={{ fontSize: 14 }}>No outstanding balances</div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Settlement Form */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Avatar
                initials={selectedFriend.friend?.name?.split(' ').map(n => n[0]).join('') || '?'}
                color={selectedFriend.balance < 0 ? '#1FD888' : '#d23214'}
                size={46}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>
                  {selectedFriend.friend?.name || 'Unknown'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>
                  {selectedFriend.balance < 0
                    ? `Owes you LKR ${Math.abs(selectedFriend.balance).toFixed(2)}`
                    : `You owe LKR ${selectedFriend.balance.toFixed(2)}`}
                </div>
              </div>
            </div>

            {/* Settlement Mode */}
            <label style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: 10,
            }}>
              Settlement Amount
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <button
                onClick={() => {
                  setSettleMode('full')
                  setCustomAmount('')
                }}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  border: `1.5px solid ${settleMode === 'full' ? '#1FD888' : 'rgba(255,255,255,0.75)'}`,
                  background: settleMode === 'full'
                    ? 'linear-gradient(135deg, rgba(31,216,136,0.15), rgba(31,216,136,0.10))'
                    : 'rgba(255,255,255,0.50)',
                  cursor: 'pointer',
                  transition: 'all .18s',
                  boxShadow: settleMode === 'full' ? '0 4px 16px rgba(31,216,136,0.25)' : '0 2px 6px rgba(0,0,0,0.04)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: settleMode === 'full' ? '#1FD888' : 'var(--text)',
                }}
              >
                Full Amount
              </button>
              <button
                onClick={() => setSettleMode('custom')}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: 'var(--r-md)',
                  border: `1.5px solid ${settleMode === 'custom' ? '#1FD888' : 'rgba(255,255,255,0.75)'}`,
                  background: settleMode === 'custom'
                    ? 'linear-gradient(135deg, rgba(31,216,136,0.15), rgba(31,216,136,0.10))'
                    : 'rgba(255,255,255,0.50)',
                  cursor: 'pointer',
                  transition: 'all .18s',
                  boxShadow: settleMode === 'custom' ? '0 4px 16px rgba(31,216,136,0.25)' : '0 2px 6px rgba(0,0,0,0.04)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 14,
                  fontWeight: 700,
                  color: settleMode === 'custom' ? '#1FD888' : 'var(--text)',
                }}
              >
                Custom Amount
              </button>
            </div>

            {settleMode === 'custom' && (
              <CurrencyInput
                label="Amount to Settle"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="0.00"
              />
            )}

            {settleMode === 'full' && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(31,216,136,0.15), rgba(31,216,136,0.10))',
                border: '1.5px solid rgba(31,216,136,0.30)',
                borderRadius: 'var(--r-md)',
                padding: '13px 16px',
                marginBottom: 16,
                boxShadow: '0 4px 14px rgba(31,216,136,0.15)',
              }}>
                <div style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  Settling:
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                  LKR {Math.abs(selectedFriend.balance).toFixed(2)}
                </div>
              </div>
            )}

            {/* Note */}
            <Input
              label="Note (optional)"
              placeholder="e.g. Paid via bank transfer"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => setSelectedFriend(null)} style={{ flex: 1 }}>
              ← Back
            </Button>
            <Button onClick={handleSettle} disabled={!canSettle()} style={{ flex: 2 }}>
              Settle ✓
            </Button>
          </div>
        </>
      )}
    </BottomSheet>
  )
}
