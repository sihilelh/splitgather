import React, { useState, useMemo } from 'react'
import { BottomSheet, Input, Button, Avatar, Pill } from './UI.jsx'
import { CATEGORY_META } from '../constants/categories.js'
import CurrencyInput from './CurrencyInput.jsx'
import ExpenseSummaryChip from './ExpenseSummaryChip.jsx'

export default function AddExpenseModal({ open, onClose, friends, groups, currentUser, onAdd }) {
  // Derive currentUserId from the full currentUser object
  const currentUserId = currentUser?.id

  const [step, setStep]         = useState(1)
  const [title, setTitle]       = useState('')
  const [amount, setAmount]     = useState('')
  const [category, setCategory] = useState('food')
  const [groupId, setGroupId]   = useState(null)
  // Default date to today
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10))
  const [splitWith, setSplitWith] = useState([])
  const [splitMode, setSplitMode] = useState('equal') // 'equal', 'percentage', 'custom'
  const [customSplits, setCustomSplits] = useState({}) // { userId: amount }
  const [percentageSplits, setPercentageSplits] = useState({}) // { userId: percentage }
  const [amountFocused, setAmountFocused] = useState(false)
  // null means "current user" is the payer
  const [paidBy, setPaidBy] = useState(null)

  // The effective payer ID — falls back to current user if none selected
  const effectivePaidBy = paidBy || currentUserId

  const reset = () => {
    setStep(1)
    setTitle('')
    setAmount('')
    setCategory('food')
    setGroupId(null)
    setExpenseDate(new Date().toISOString().slice(0, 10))
    setSplitWith([])
    setSplitMode('equal')
    setCustomSplits({})
    setPercentageSplits({})
    setAmountFocused(false)
    setPaidBy(null)
  }
  
  const handleClose = () => { reset(); onClose() }

  const toggleFriend = id => {
    setSplitWith(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      // If the deselected friend was the payer, reset paidBy
      if (!next.includes(id) && paidBy === id) {
        setPaidBy(null)
      }
      return next
    })
  }
  
  const perPerson = amount && splitWith.length > 0
    ? (parseFloat(amount) / (splitWith.length + 1)).toFixed(2) : null

  // All participants: current user + selected friends
  const allParticipants = useMemo(() => {
    const me = currentUser ? [{ id: currentUserId, name: currentUser.name || 'You', initials: currentUser.initials, color: currentUser.color }] : []
    const selectedFriends = friends.filter(f => splitWith.includes(f.id))
    return [...me, ...selectedFriends]
  }, [currentUser, currentUserId, friends, splitWith])

  // Calculate total for custom split
  const customTotal = useMemo(() => {
    return Object.values(customSplits).reduce((s, v) => s + parseFloat(v || 0), 0)
  }, [customSplits])
  
  // Calculate percentage splits validation
  const percentageTotal = useMemo(() => {
    return Object.values(percentageSplits).reduce((s, v) => s + parseFloat(v || 0), 0)
  }, [percentageSplits])
  
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

  const generateSplitData = () => {
    const numPeople = splitWith.length + 1
    const splits = {}
    const payer = effectivePaidBy

    // All people involved: current user + selected friends
    const allInvolved = [...splitWith, currentUserId]
    // Participants = all involved except the payer
    const splitWithForAPI = allInvolved.filter(id => id !== payer)

    if (splitMode === 'equal') {
      const perPersonAmount = parseFloat(amount) / numPeople
      allInvolved.forEach(id => {
        splits[id] = perPersonAmount
      })
    } else if (splitMode === 'percentage') {
      allInvolved.forEach(id => {
        splits[id] = (parseFloat(amount) * (percentageSplits[id] || 0)) / 100
      })
    } else if (splitMode === 'custom') {
      allInvolved.forEach(id => {
        splits[id] = parseFloat(customSplits[id] || 0)
      })
    }

    return {
      title: title.trim(),
      description: title.trim(),
      amount: parseFloat(amount),
      category: category || 'other',
      groupId: groupId || null,
      date: expenseDate || new Date().toISOString().slice(0, 10),
      expenseDate: expenseDate || null,
      paidBy: payer,
      splitWith: splitWithForAPI,
      splitMode,
      splitData: splits,
    }
  }

  // Input style shared for split inputs
  const splitInputStyle = {
    flex: 1, height: 36, padding: '0 8px', borderRadius: 8,
    border: '1.5px solid rgba(255,255,255,0.75)',
    background: 'rgba(255,255,255,0.50)', fontSize: 12, fontFamily: 'var(--font-body)',
    color: 'var(--text)',
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={step===1?'Add Expense':step===2?'Who\'s Involved':'How to Split'}>
      {/* Progress bar */}
      <div style={{ display:'flex', gap:6, marginBottom:22 }}>
        {[1,2,3].map(s=>(
          <div key={s} style={{
            flex:1, height:4, borderRadius:4,
            background: s<=step
              ? 'linear-gradient(90deg,#1FD888,#4BE5A0)'
              : 'rgba(31,216,136,0.12)',
            transition:'background .35s',
            boxShadow: s<=step ? '0 2px 8px rgba(31,216,136,0.35)' : 'none',
          }}/>
        ))}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 ? (
        <>
          <Input label="What was it for?" placeholder="e.g. Pizza Night"
            value={title} onChange={e=>setTitle(e.target.value)} autoFocus />

          <CurrencyInput
            label="Amount (LKR)"
            value={amount}
            onChange={e=>setAmount(e.target.value)}
            placeholder="0.00"
            onFocus={()=>setAmountFocused(true)}
            onBlur={()=>setAmountFocused(false)}
          />

          {/* Date */}
          <div style={{ marginBottom: 16 }}>
            <label style={{
              display: 'block', fontSize: 11, fontWeight: 700,
              color: 'var(--text3)', textTransform: 'uppercase',
              letterSpacing: '1px', marginBottom: 8,
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
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Category */}
          <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)',
            textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>Category</label>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
            {Object.entries(CATEGORY_META).map(([key,meta])=>(
              <Pill key={key} active={category===key} color={meta.color} onClick={()=>setCategory(key)}>
                {meta.emoji} {meta.label}
              </Pill>
            ))}
          </div>

          {/* Group */}
          <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)',
            textTransform:'uppercase', letterSpacing:'1px', marginBottom:8 }}>Group (optional)</label>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:22 }}>
            <Pill active={!groupId} onClick={()=>setGroupId(null)}>None</Pill>
            {groups.map(g=>(
              <Pill key={g.id} active={groupId===g.id} color={g.color} onClick={()=>setGroupId(g.id)}>
                {g.emoji} {g.name}
              </Pill>
            ))}
          </div>

          <Button onClick={()=>setStep(2)} disabled={!canNext}>
            Next → Add People
          </Button>
        </>

      /* ── STEP 2 ── */
      ) : step === 2 ? (
        <>
          <ExpenseSummaryChip title={title} amount={amount} />

          <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)',
            textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>Who was involved?</label>

          {friends.map(f=>{
            const sel = splitWith.includes(f.id)
            return (
              <div key={f.id} onClick={()=>toggleFriend(f.id)}
                style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'12px 14px', borderRadius:'var(--r-md)',
                  border:`1.5px solid ${sel ? f.color+'80' : 'rgba(255,255,255,0.75)'}`,
                  background: sel
                    ? `linear-gradient(135deg, ${f.color}18, ${f.color}08)`
                    : 'rgba(255,255,255,0.50)',
                  backdropFilter:'blur(14px)',
                  WebkitBackdropFilter:'blur(14px)',
                  marginBottom:8, cursor:'pointer',
                  transition:'all .18s',
                  boxShadow: sel ? `0 4px 16px ${f.color}25` : '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <Avatar initials={f.initials} color={f.color} size={38}/>
                <span style={{ flex:1, fontWeight:700, fontSize:15, color:'var(--text)' }}>{f.name}</span>
                <div style={{
                  width:24, height:24, borderRadius:'50%',
                  border:`2px solid ${sel?f.color:'rgba(31,216,136,0.25)'}`,
                  background: sel ? f.color : 'rgba(255,255,255,0.50)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#0a0a0a', fontSize:13, fontWeight:900,
                  transition:'all .18s',
                  boxShadow: sel ? `0 2px 8px ${f.color}40` : 'none',
                }}>{sel?'✓':''}</div>
              </div>
            )
          })}

          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <Button variant="secondary" onClick={()=>setStep(1)} style={{flex:1}}>← Back</Button>
            <Button onClick={()=>setStep(3)} disabled={splitWith.length===0} style={{flex:2}}>
              Next → Split Method
            </Button>
          </div>
        </>

      /* ── STEP 3 ── */
      ) : (
        <>
          <ExpenseSummaryChip peopleCount={splitWith.length+1} amount={amount} />

          {/* ── Paid by selector ── */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)',
              textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>
              Paid by
            </label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {allParticipants.map(p => {
                const isMe = p.id === currentUserId
                const label = isMe ? 'You' : p.name.split(' ')[0]
                const sel = effectivePaidBy === p.id
                return (
                  <div key={p.id} onClick={() => setPaidBy(p.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '7px 12px', borderRadius: 40,
                      border: `1.5px solid ${sel ? (p.color || '#1FD888') + 'CC' : 'rgba(255,255,255,0.75)'}`,
                      background: sel
                        ? `linear-gradient(135deg, ${p.color || '#1FD888'}28, ${p.color || '#1FD888'}10)`
                        : 'rgba(255,255,255,0.50)',
                      cursor: 'pointer', transition: 'all .18s',
                      fontWeight: 700, fontSize: 13, color: sel ? (p.color || '#1FD888') : 'var(--text)',
                      boxShadow: sel ? `0 3px 10px ${(p.color||'#1FD888')}30` : 'none',
                    }}
                  >
                    <Avatar initials={p.initials || label[0]} color={p.color || '#1FD888'} size={22} />
                    {label}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Split mode selector ── */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)',
              textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>
              and split
            </label>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {[
                { id: 'equal',      label: 'Equally' },
                { id: 'percentage', label: 'By Percentage' },
                { id: 'custom',     label: 'Custom Amount' },
              ].map(mode => (
                <div key={mode.id} onClick={() => setSplitMode(mode.id)}
                  style={{
                    padding: '7px 14px', borderRadius: 40,
                    border: `1.5px solid ${splitMode===mode.id ? '#1FD888CC' : 'rgba(255,255,255,0.75)'}`,
                    background: splitMode===mode.id
                      ? 'linear-gradient(135deg, rgba(31,216,136,0.22), rgba(31,216,136,0.10))'
                      : 'rgba(255,255,255,0.50)',
                    cursor: 'pointer', transition: 'all .18s',
                    fontWeight: 700, fontSize: 13,
                    color: splitMode===mode.id ? '#1FD888' : 'var(--text)',
                    boxShadow: splitMode===mode.id ? '0 3px 10px rgba(31,216,136,0.25)' : 'none',
                  }}
                >
                  {mode.label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Split mode detail ── */}
          {splitMode === 'equal' ? (
            <div style={{
              background:'linear-gradient(135deg, rgba(31,216,136,0.15), rgba(31,216,136,0.10))',
              border:'1.5px solid rgba(31,216,136,0.30)',
              borderRadius:'var(--r-md)', padding:'13px 16px',
              marginBottom:16,
              boxShadow:'0 4px 14px rgba(31,216,136,0.15)',
            }}>
              <div style={{ color:'var(--accent)', fontSize:13, fontWeight:700, marginBottom:8 }}>
                Each of {splitWith.length+1} pays:
              </div>
              <div style={{ fontSize:28, fontWeight:800, color:'var(--accent)', letterSpacing:'-0.02em' }}>
                LKR {perPerson}
              </div>
            </div>

          ) : splitMode === 'percentage' ? (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', marginBottom:10 }}>
                Assign percentages — total: {percentageTotal.toFixed(1)}%
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {allParticipants.map(p => {
                  const isMe = p.id === currentUserId
                  const label = isMe ? 'You' : p.name.split(' ')[0]
                  return (
                    <div key={p.id} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', minWidth:46, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {label}
                      </span>
                      <input
                        type="number" min="0" max="100" step="any" placeholder="0"
                        value={percentageSplits[p.id] ?? ''}
                        onChange={e => setPercentageSplits({ ...percentageSplits, [p.id]: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                        style={splitInputStyle}
                      />
                      <span style={{ fontSize:11, color:'var(--text3)', minWidth:16 }}>%</span>
                      <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)', minWidth:60, textAlign:'right' }}>
                        LKR {((parseFloat(percentageSplits[p.id] || 0) / 100) * parseFloat(amount)).toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>
              {Math.abs(percentageTotal - 100) > 0.1 && (
                <div style={{ fontSize:12, color:'#ef4444', marginTop:8, fontWeight:600 }}>
                  Percentages must sum to 100% (currently {percentageTotal.toFixed(1)}%)
                </div>
              )}
            </div>

          ) : (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text3)', marginBottom:10 }}>
                Enter amounts — total: LKR {customTotal.toFixed(2)} / {parseFloat(amount).toFixed(2)}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {allParticipants.map(p => {
                  const isMe = p.id === currentUserId
                  const label = isMe ? 'You' : p.name.split(' ')[0]
                  return (
                    <div key={p.id} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', minWidth:46, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {label}
                      </span>
                      <input
                        type="number" min="0" step="any" placeholder="0.00"
                        value={customSplits[p.id] ?? ''}
                        onChange={e => setCustomSplits({ ...customSplits, [p.id]: e.target.value === '' ? '' : e.target.value })}
                        style={splitInputStyle}
                      />
                      <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)', minWidth:30 }}>LKR</span>
                    </div>
                  )
                })}
              </div>
              {Math.abs(customTotal - parseFloat(amount)) > 0.01 && (
                <div style={{ fontSize:12, color:'#ef4444', marginTop:8, fontWeight:600 }}>
                  Total must equal LKR {parseFloat(amount).toFixed(2)} (currently LKR {customTotal.toFixed(2)})
                </div>
              )}
            </div>
          )}

          <div style={{ display:'flex', gap:8 }}>
            <Button variant="secondary" onClick={()=>setStep(2)} style={{flex:1}}>← Back</Button>
            <Button onClick={()=>{
              const splitData = generateSplitData()
              onAdd(splitData)
              handleClose()
            }} disabled={!isSplitValid()} style={{flex:2}}>
              Add Expense ✓
            </Button>
          </div>
        </>
      )}
    </BottomSheet>
  )
}
