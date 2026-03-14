import React from 'react'
import { Avatar, BalanceBadge } from './UI.jsx'

export default function FriendRow({ friend, onClick }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <Avatar initials={friend.initials} color={friend.color} size={44} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{friend.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 1 }}>
          {friend.balance === 0
            ? 'All settled up ✓'
            : friend.balance > 0
            ? `Owes you LKR ${friend.balance.toFixed(2)}`
            : `You owe LKR ${Math.abs(friend.balance).toFixed(2)}`}
        </div>
      </div>
      <BalanceBadge value={friend.balance} />
    </div>
  )
}
