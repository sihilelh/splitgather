import React, { useState, useMemo, useEffect } from 'react'
import { BottomSheet, Input, Button, Avatar, Pill } from './UI.jsx'
import { CATEGORY_META } from '../constants/categories.js'
import CurrencyInput from './CurrencyInput.jsx'
import ExpenseSummaryChip from './ExpenseSummaryChip.jsx'

export default function EditExpenseModal({ open, onClose, record, friends, groups, currentUserId, onUpdate }) {
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')
  const [groupId, setGroupId] = useState(null)
  const [expenseDate, setExpenseDate] = useState('')
  const [splitWith, setSplitWith] = useState([])
  const [splitMode, setSplitMode] = useState('equal')
  const [customSplits, setCustomSplits] = useState({})
  const [percentageSplits, setPercentageSplits] = useState({})
  const [amountFocused, setAmountFocused] = useState(false)

  // Initialize form with record data
  useEffect(() => {
    if (record && open) {
      setTitle(record.description || '')
      setAmount(record.amount?.toString() || '')
      setCategory(record.category || 'food')
      setGroupId(record.groupId || null)
      if (record.expenseDate) {
        const date = new Date(record.expenseDate)
        setExpenseDate(date.toISOString().split('T')[0])
      } else {
        setExpenseDate('')
      }

      // Extract participants from splits
      if (record.splits) {
        const participantIds = record.splits
          .map(s => s.userId)
          .filter(id => id !== record.paidBy && id !== currentUserId)
        setSplitWith(participantIds)

        // Determine split mode and populate split data
        const splitAmounts = {}
        record.splits.forEach(split => {
          splitAmounts[split.userId] = split.amount
        })

        // Check if equal split
        const amounts = Object.values(splitAmounts)
        const allEqual = amounts.every(amt => Math.abs(amt - amounts[0]) < 0.01)
        if (allEqual) {
          setSplitMode('equal')
        } else {
          // Check if percentages (roughly)
          const total = record.amount
          const isPercentage = amounts.every(amt => {
            const pct = (amt / total) * 100
            return Number.isInteger(pct) || Math.abs(pct - Math.round(pct)) < 0.1
          })
          if (isPercentage) {
            setSplitMode('percentage')
            Object.entries(splitAmounts).forEach(([userId, amt]) => {
              percentageSplits[userId] = ((amt / total) * 100).toFixed(1)
            })
            setPercentageSplits({ ...percentageSplits })
          } else {
            setSplitMode('custom')
            setCustomSplits(splitAmounts)
          }
        }
      }
      setStep(1)
    }
  }, [record, open, currentUserId])

  const reset = () => {
    setStep(1)
    setTitle('')
    setAmount('')
    setCategory('food')
    setGroupId(null)
    setExpenseDate('')
    setSplitWith([])
    setSplitMode('equal')
    setCustomSplits({})
    setPercentageSplits({})
    setAmountFocused(false)
  }

  const handleClose = () => { reset(); onClose() }
  const toggleFriend = id => setSplitWith(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const perPerson = amount && splitWith.length > 0
    ? (parseFloat(amount) / (splitWith.length + 1)).toFixed(2) : null

  const customTotal = useMemo(() => {
    const myAmount = customSplits[currentUserId] || 0
    const othersTotal = Object.values(customSplits).reduce((s, v) => s + parseFloat(v || 0), 0) - myAmount
    return myAmount + othersTotal
  }, [customSplits, currentUserId])

  const percentageTotal = useMemo(() => {
    const myPct = percentageSplits[currentUserId] || 0
    const othersTotal = Object.values(percentageSplits).reduce((s, v) => s + parseFloat(v || 0), 0) - myPct
    return myPct + othersTotal
  }, [percentageSplits, currentUserId])

  const canNext = title.trim() && parseFloat(amount) > 0

  const isSplitValid = () => {
    if (splitWith.length === 0) return false
    if (splitMode === 'custom') {
      return Math.abs(customTotal - parseFloat(amount)) < 0.01
    } else if (splitMode === 'percentage') {
      return Math.abs(percentageTotal - 100) < 0.1
    }
    return true
  }

  const generateUpdateData = () => {
    const numPeople = splitWith.length + 1
    const splits = {}

    if (splitMode === 'equal') {
      const perPersonAmount = parseFloat(amount) / numPeople
      splits[currentUserId] = perPersonAmount
      splitWith.forEach(id => {
        splits[id] = perPersonAmount
      })
    } else if (splitMode === 'percentage') {
      splits[currentUserId] = (parseFloat(amount) * (percentageSplits[currentUserId] || 0)) / 100
      splitWith.forEach(id => {
        splits[id] = (parseFloat(amount) * (percentageSplits[id] || 0)) / 100
      })
    } else if (splitMode === 'custom') {
      Object.entries(customSplits).forEach(([id, amt]) => {
        splits[id] = parseFloat(amt || 0)
      })
    }

    return {
      description: title.trim(),
      amount: parseFloat(amount),
      category: category || null,
      groupId: groupId || null,
      expenseDate: expenseDate || null,
      paidBy: record?.paidBy || currentUserId,
      participantIds: splitWith,
      splitMode,
      splitData: splits,
    }
  }

  const handleUpdate = () => {
    const updateData = generateUpdateData()
    onUpdate(record.id, updateData)
    handleClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={step === 1 ? 'Edit Expense' : step === 2 ? "Who's Involved" : 'How to Split'}>
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 22 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: s <= step
              ? 'linear-gradient(90deg,#1FD888,#4BE5A0)'
              : 'rgba(31,216,136,0.12)',
            transition: 'background .35s',
            boxShadow: s <= step ? '0 2px 8px rgba(31,216,136,0.35)' : 'none',
          }} />
        ))}
      </div>

      {step === 1 ? (
        <>
          <Input label="What was it for?" placeholder="e.g. Pizza Night"
            value={title} onChange={e => setTitle(e.target.value)} autoFocus />

          <CurrencyInput
            label="Amount (LKR)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            onFocus={() => setAmountFocused(true)}
            onBlur={() => setAmountFocused(false)}
          />

          {/* Date */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: 8,
            }}>
              Date of Expense
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={e => setExpenseDate(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.60)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1.5px solid rgba(255,255,255,0.80)',
                borderRadius: 'var(--r-md)',
                padding: '13px 14px',
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text)',
                fontFamily: 'var(--font-body)',
                outline: 'none',
              }}
            />
          </div>

          {/* Category */}
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8,
          }}>Category</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {Object.entries(CATEGORY_META).map(([key, meta]) => (
              <Pill key={key} active={category === key} color={meta.color} onClick={() => setCategory(key)}>
                {meta.emoji} {meta.label}
              </Pill>
            ))}
          </div>

          {/* Group */}
          <label style={{
            display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8,
          }}>Group (optional)</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 22 }}>
            <Pill active={!groupId} onClick={() => setGroupId(null)}>None</Pill>
            {groups.map(g => (
              <Pill key={g.id} active={groupId === g.id} color={g.color} onClick={() => setGroupId(g.id)}>
                {g.emoji} {g.name}
              </Pill>
            ))}
          </div>

          <Button onClick={() => setStep(2)} disabled={!canNext}>
            Next → Add People
          </Button>
        </>
      ) : step === 2 ? (
        <>
          <ExpenseSummaryChip title={title} amount={amount} />

          <label style={{
            display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10,
          }}>Who was involved?</label>

          {friends.map(f => {
            const sel = splitWith.includes(f.id)
            return (
              <div key={f.id} onClick={() => toggleFriend(f.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 'var(--r-md)',
                  border: `1.5px solid ${sel ? f.color + '80' : 'rgba(255,255,255,0.75)'}`,
                  background: sel
                    ? `linear-gradient(135deg, ${f.color}18, ${f.color}08)`
                    : 'rgba(255,255,255,0.50)',
                  backdropFilter: 'blur(14px)',
                  WebkitBackdropFilter: 'blur(14px)',
                  marginBottom: 8, cursor: 'pointer',
                  transition: 'all .18s',
                  boxShadow: sel ? `0 4px 16px ${f.color}25` : '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <Avatar initials={f.initials} color={f.color} size={38} />
                <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{f.name}</span>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  border: `2px solid ${sel ? f.color : 'rgba(31,216,136,0.25)'}`,
                  background: sel ? f.color : 'rgba(255,255,255,0.50)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#0a0a0a', fontSize: 13, fontWeight: 900,
                  transition: 'all .18s',
                  boxShadow: sel ? `0 2px 8px ${f.color}40` : 'none',
                }}>{sel ? '✓' : ''}</div>
              </div>
            )
          })}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Button variant="secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</Button>
            <Button onClick={() => setStep(3)} disabled={splitWith.length === 0} style={{ flex: 2 }}>
              Next → Split Method
            </Button>
          </div>
        </>
      ) : (
        <>
          <ExpenseSummaryChip peopleCount={splitWith.length + 1} amount={amount} />

          <label style={{
            display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text3)',
            textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10,
          }}>Split method</label>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {[
              { id: 'equal', label: 'Equal Split', desc: 'Divide equally among all' },
              { id: 'percentage', label: 'By Percentage', desc: 'Assign percentages' },
              { id: 'custom', label: 'Custom Amount', desc: 'Enter amounts manually' }
            ].map(mode => (
              <div key={mode.id} onClick={() => setSplitMode(mode.id)}
                style={{
                  padding: '12px 14px', borderRadius: 'var(--r-md)',
                  border: `1.5px solid ${splitMode === mode.id ? '#1FD888' : 'rgba(255,255,255,0.75)'}`,
                  background: splitMode === mode.id
                    ? 'linear-gradient(135deg, rgba(31,216,136,0.15), rgba(31,216,136,0.10))'
                    : 'rgba(255,255,255,0.50)',
                  cursor: 'pointer', transition: 'all .18s',
                  boxShadow: splitMode === mode.id ? '0 4px 16px rgba(31,216,136,0.25)' : '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>
                  {splitMode === mode.id ? '✓' : ''} {mode.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{mode.desc}</div>
              </div>
            ))}
          </div>

          {/* Split mode content - same as AddExpenseModal */}
          {splitMode === 'equal' ? (
            <div style={{
              background: 'linear-gradient(135deg, rgba(31,216,136,0.15), rgba(31,216,136,0.10))',
              border: '1.5px solid rgba(31,216,136,0.30)',
              borderRadius: 'var(--r-md)', padding: '13px 16px',
              marginBottom: 16,
              boxShadow: '0 4px 14px rgba(31,216,136,0.15)',
            }}>
              <div style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                Each of {splitWith.length + 1} pays:
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
                LKR {perPerson}
              </div>
            </div>
          ) : splitMode === 'percentage' ? (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 10 }}>
                Assign percentages (total: {percentageTotal.toFixed(1)}%)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div key={currentUserId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', minWidth: 40 }}>You</span>
                  <input type="number" min="0" max="100" placeholder="%"
                    value={percentageSplits[currentUserId] || ''}
                    onChange={e => setPercentageSplits({ ...percentageSplits, [currentUserId]: parseFloat(e.target.value) || 0 })}
                    style={{
                      flex: 1, height: 36, padding: '0 8px', borderRadius: 8,
                      border: '1.5px solid rgba(255,255,255,0.75)',
                      background: 'rgba(255,255,255,0.50)', fontSize: 12, fontFamily: 'var(--font-body)',
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', minWidth: 50, textAlign: 'right' }}>
                    LKR {((parseFloat(percentageSplits[currentUserId] || 0) / 100) * parseFloat(amount)).toFixed(2)}
                  </span>
                </div>
                {splitWith.map(fid => {
                  const f = friends.find(x => x.id === fid)
                  return (
                    <div key={fid} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', minWidth: 40 }}>{f?.name.split(' ')[0] || '?'}</span>
                      <input type="number" min="0" max="100" placeholder="%"
                        value={percentageSplits[fid] || ''}
                        onChange={e => setPercentageSplits({ ...percentageSplits, [fid]: parseFloat(e.target.value) || 0 })}
                        style={{
                          flex: 1, height: 36, padding: '0 8px', borderRadius: 8,
                          border: '1.5px solid rgba(255,255,255,0.75)',
                          background: 'rgba(255,255,255,0.50)', fontSize: 12, fontFamily: 'var(--font-body)',
                        }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', minWidth: 50, textAlign: 'right' }}>
                        LKR {((parseFloat(percentageSplits[fid] || 0) / 100) * parseFloat(amount)).toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>
              {Math.abs(percentageTotal - 100) > 0.1 && (
                <div style={{ fontSize: 12, color: '#ef4444', marginTop: 8, fontWeight: 600 }}>
                  Percentages must sum to 100% (currently {percentageTotal.toFixed(1)}%)
                </div>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 10 }}>
                Enter amounts (total: LKR {customTotal.toFixed(2)})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div key={currentUserId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', minWidth: 40 }}>You</span>
                  <input type="number" min="0" placeholder="0.00"
                    value={customSplits[currentUserId] || ''}
                    onChange={e => setCustomSplits({ ...customSplits, [currentUserId]: e.target.value })}
                    style={{
                      flex: 1, height: 36, padding: '0 8px', borderRadius: 8,
                      border: '1.5px solid rgba(255,255,255,0.75)',
                      background: 'rgba(255,255,255,0.50)', fontSize: 12, fontFamily: 'var(--font-body)',
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', minWidth: 30 }}>LKR</span>
                </div>
                {splitWith.map(fid => {
                  const f = friends.find(x => x.id === fid)
                  return (
                    <div key={fid} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', minWidth: 40 }}>{f?.name.split(' ')[0] || '?'}</span>
                      <input type="number" min="0" placeholder="0.00"
                        value={customSplits[fid] || ''}
                        onChange={e => setCustomSplits({ ...customSplits, [fid]: e.target.value })}
                        style={{
                          flex: 1, height: 36, padding: '0 8px', borderRadius: 8,
                          border: '1.5px solid rgba(255,255,255,0.75)',
                          background: 'rgba(255,255,255,0.50)', fontSize: 12, fontFamily: 'var(--font-body)',
                        }}
                      />
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', minWidth: 30 }}>LKR</span>
                    </div>
                  )
                })}
              </div>
              {Math.abs(customTotal - parseFloat(amount)) > 0.01 && (
                <div style={{ fontSize: 12, color: '#ef4444', marginTop: 8, fontWeight: 600 }}>
                  Total must equal LKR {parseFloat(amount).toFixed(2)} (currently LKR {customTotal.toFixed(2)})
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>← Back</Button>
            <Button onClick={handleUpdate} disabled={!isSplitValid()} style={{ flex: 2 }}>
              Update Expense ✓
            </Button>
          </div>
        </>
      )}
    </BottomSheet>
  )
}
