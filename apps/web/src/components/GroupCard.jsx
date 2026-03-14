import React from 'react'
import { Card, BalanceBadge } from './UI.jsx'

export default function GroupCard({ group, expenseCount, onClick }) {
  return (
    <Card onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          fontSize: 28,
          width: 52,
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg,${group.color}28,${group.color}10)`,
          borderRadius: 15,
          border: `1.5px solid ${group.color}35`,
          boxShadow: `0 4px 14px ${group.color}20`,
          flexShrink: 0,
        }}>
          {group.icon || group.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>
            {group.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>
            {group.participantCount ? `${group.participantCount} members` : (group.members ? `${group.members.length + 1} members` : '')}
            {expenseCount !== undefined && ` · ${expenseCount} expenses`}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
          <BalanceBadge value={group.balance} />
          <span style={{ color: 'var(--text3)', fontSize: 16 }}>›</span>
        </div>
      </div>
    </Card>
  )
}
