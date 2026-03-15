import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SectionLabel, Avatar, EmptyState } from '../components/UI.jsx'
import FloatingActionButton from '../components/FloatingActionButton.jsx'
import BalanceHeroCard from '../components/BalanceHeroCard.jsx'
import ExpenseCard from '../components/ExpenseCard.jsx'
import GroupCard from '../components/GroupCard.jsx'
import { useRecords } from '../hooks/useRecords.jsx'

export default function HomeScreen({ currentUser, friends, groups, expenses: expensesProp, totalOwed, totalOwe, netBalance, onAddExpense }) {
  const navigate = useNavigate()
  const { expenses: recordsExpenses, loading: recordsLoading } = useRecords()

  // Use expenses from prop if provided, otherwise from useRecords hook
  const expenses = expensesProp || recordsExpenses || []
  const recent = [...expenses].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 4)
  const currentUserId = currentUser?.id || 'u1'
  const getName = id => {
    if (String(id) === String(currentUserId)) return 'You'
    return friends.find(f => String(f.id) === String(id))?.name || '?'
  }
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning ☀️' : hour < 17 ? 'Good afternoon 🌤' : 'Good evening 🌙'

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 120, position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div className="a1" style={{ padding: '52px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 3, fontWeight: 500 }}>{greeting}</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Hey, {currentUser?.name?.split(' ')[0] || 'User'} 👋
            </h1>
          </div>
          <div style={{ position: 'relative' }}>
            <Avatar initials={currentUser?.initials || 'U'} color={currentUser?.color || "#1FD888"} size={50} />
          </div>
        </div>

        {/* Net balance hero card */}
        <BalanceHeroCard
          title="Net Balance"
          balance={netBalance}
          breakdown={[
            { label: 'Owed to you', value: totalOwed, positive: true },
            { label: 'You owe', value: totalOwe, positive: false },
          ]}
        />
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Quick actions */}
        <div className="a3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 6 }}>
          <button onClick={onAddExpense} style={{
            background: 'linear-gradient(135deg,#1FD888,#4BE5A0)',
            border: '1.5px solid rgba(255,255,255,0.70)',
            borderRadius: 'var(--r-md)', padding: '16px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 9,
            fontFamily: 'var(--font-body)',
            boxShadow: '0 6px 20px rgba(31,216,136,0.30)',
            transition: 'transform .12s, box-shadow .2s',
          }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: 22 }}>＋</span>
            <span style={{ fontWeight: 800, fontSize: 14, color: '#0a0a0a' }}>Add Expense</span>
          </button>
          <button onClick={() => navigate('/friends')} style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255,255,255,0.80)',
            borderRadius: 'var(--r-md)', padding: '16px 14px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 9,
            fontFamily: 'var(--font-body)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
            transition: 'transform .12s',
          }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span style={{ fontSize: 22 }}>🤝</span>
            <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>Settle Up</span>
          </button>
        </div>

        {/* Who owes you */}
        {friends.filter(f => f.balance !== 0).length > 0 && (
          <div className="a4">
            <SectionLabel>Friends 💚</SectionLabel>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {friends.filter(f => f.balance !== 0).map(f => (
                <div key={f.id} onClick={() => navigate('/friends')} style={{
                  flexShrink: 0, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.52)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1.5px solid rgba(255,255,255,0.82)',
                  borderRadius: 'var(--r-md)', padding: '12px 14px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  minWidth: 80,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
                  transition: 'transform .12s',
                }}
                  onMouseDown={e => e.currentTarget.style.transform = 'scale(0.93)'}
                  onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Avatar initials={f.initials} color={f.color} size={38} />

                  {
                    // negative values mean they owe me, positive values mean i owe them
                    f.balance < 0 ? (<>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>{f.name.split(' ')[0]}</div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--positive)' }}>+LKR {Math.abs(f.balance).toFixed(2)}</div>
                    </>
                    ) : (
                      <>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>{f.name.split(' ')[0]}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--negative)' }}>-LKR {Math.abs(f.balance).toFixed(2)}</div>
                      </>
                    )
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Groups */}
        <div className="a4">
          <SectionLabel>
            Groups
            <button onClick={() => navigate('/groups')} style={{
              background: 'none', border: 'none',
              color: 'var(--accent)', fontSize: 13, cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 700
            }}>See all →</button>
          </SectionLabel>
          {groups.slice(0, 2).map(g => (
            <GroupCard
              key={g.id}
              group={g}
              expenseCount={(expenses || []).filter(e => String(e.groupId) === String(g.id)).length}
              onClick={() => navigate('/groups')}
            />
          ))}
        </div>

        {/* Recent */}
        <div className="a5">
          <SectionLabel>
            Recent
            <button onClick={() => navigate('/activity')} style={{
              background: 'none', border: 'none',
              color: 'var(--accent)', fontSize: 13, cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontWeight: 700
            }}>See all →</button>
          </SectionLabel>
          {recordsLoading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>
              Loading records...
            </div>
          ) : recent.length === 0 ? (
            <EmptyState emoji="📋" title="No recent expenses" subtitle="Add your first expense to get started" />
          ) : (
            recent.map(e => (
              <ExpenseCard
                key={e.id}
                expense={e}
                friends={friends}
                currentUserId={currentUserId}
                showBalance={true}
              />
            ))
          )}
        </div>
      </div>

      {/* FAB */}
      <FloatingActionButton onClick={onAddExpense} />
    </div>
  )
}
