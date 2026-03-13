import React, { useState, useMemo } from 'react'
import { BottomSheet, Input, Button, Avatar, Pill } from './UI.jsx'
import { CATEGORY_META } from '../data/mockData.js'

export default function AddExpenseModal({ open, onClose, friends, groups, onAdd }) {
  const [step, setStep]         = useState(1)
  const [title, setTitle]       = useState('')
  const [amount, setAmount]     = useState('')
  const [category, setCategory] = useState('food')
  const [groupId, setGroupId]   = useState(null)
  const [splitWith, setSplitWith] = useState([])
  const [splitMode, setSplitMode] = useState('equal') // 'equal', 'percentage', 'custom'
  const [customSplits, setCustomSplits] = useState({}) // { friendId: amount }
  const [percentageSplits, setPercentageSplits] = useState({}) // { friendId: percentage }
  const [amountFocused, setAmountFocused] = useState(false)

  const reset = () => {
    setStep(1)
    setTitle('')
    setAmount('')
    setCategory('food')
    setGroupId(null)
    setSplitWith([])
    setSplitMode('equal')
    setCustomSplits({})
    setPercentageSplits({})
    setAmountFocused(false)
  }
  
  const handleClose = () => { reset(); onClose() }
  const toggleFriend = id => setSplitWith(p => p.includes(id)?p.filter(x=>x!==id):[...p,id])
  
  const perPerson = amount && splitWith.length>0
    ? (parseFloat(amount)/(splitWith.length+1)).toFixed(2) : null
  
  // Calculate total for custom split
  const customTotal = useMemo(() => {
    const myAmount = customSplits['u1'] || 0
    const othersTotal = Object.values(customSplits).reduce((s, v) => s + parseFloat(v || 0), 0) - myAmount
    return myAmount + othersTotal
  }, [customSplits])
  
  // Calculate percentage splits validation
  const percentageTotal = useMemo(() => {
    const myPct = percentageSplits['u1'] || 0
    const othersTotal = Object.values(percentageSplits).reduce((s, v) => s + parseFloat(v || 0), 0) - myPct
    return myPct + othersTotal
  }, [percentageSplits])
  
  const canNext = title.trim() && parseFloat(amount) > 0
  
  const isSplitValid = () => {
    if (splitWith.length === 0) return false
    if (splitMode === 'custom') {
      // Check if total matches amount (within 0.01 rounding tolerance)
      return Math.abs(customTotal - parseFloat(amount)) < 0.01
    } else if (splitMode === 'percentage') {
      // Check if percentages sum to 100
      return Math.abs(percentageTotal - 100) < 0.1
    }
    return true
  }

  const generateSplitData = () => {
    const numPeople = splitWith.length + 1
    const splits = {}
    
    if (splitMode === 'equal') {
      const perPersonAmount = parseFloat(amount) / numPeople
      splits['u1'] = perPersonAmount
      splitWith.forEach(id => {
        splits[id] = perPersonAmount
      })
    } else if (splitMode === 'percentage') {
      splits['u1'] = (parseFloat(amount) * (percentageSplits['u1'] || 0)) / 100
      splitWith.forEach(id => {
        splits[id] = (parseFloat(amount) * (percentageSplits[id] || 0)) / 100
      })
    } else if (splitMode === 'custom') {
      Object.entries(customSplits).forEach(([id, amt]) => {
        splits[id] = parseFloat(amt || 0)
      })
    }
    
    return {
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      groupId,
      splitWith,
      paidBy: 'u1',
      splits, // Add detailed split information
    }
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

      {step===1 ? (
        <>
          <Input label="What was it for?" placeholder="e.g. Pizza Night"
            value={title} onChange={e=>setTitle(e.target.value)} autoFocus />

          {/* Amount */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)',
              textTransform:'uppercase', letterSpacing:'1px', marginBottom:6 }}>Amount (LKR)</label>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-52%)',
                color: amountFocused || amount ? 'var(--accent)' : 'var(--text3)', 
                fontSize:20, fontWeight:800,
                transition: 'color .2s' }}>LKR</span>
              <input type="number" placeholder="0.00" value={amount} onChange={e=>setAmount(e.target.value)}
                style={{
                  width:'100%',
                  background:'rgba(255,255,255,0.60)',
                  backdropFilter:'blur(12px)',
                  WebkitBackdropFilter:'blur(12px)',
                  border:'1.5px solid rgba(255,255,255,0.80)',
                  borderRadius:'var(--r-md)',
                  color:'var(--text)', padding:'13px 14px 13px 34px',
                  fontSize:26, fontWeight:800, outline:'none',
                  fontFamily:'var(--font-body)',
                  boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
                  transition:'border-color .2s, box-shadow .2s',
                }}
                onFocus={e=>{setAmountFocused(true);e.target.style.borderColor='#1FD888';e.target.style.boxShadow='0 0 0 3px rgba(31,216,136,.25)'}}
                onBlur={e=>{setAmountFocused(false);e.target.style.borderColor='rgba(255,255,255,0.80)';e.target.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'}}
              />
            </div>
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
      ) : step === 2 ? (
        <>
          {/* Expense summary chip */}
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'13px 16px', marginBottom:16,
            background:'rgba(255,255,255,0.55)',
            backdropFilter:'blur(12px)',
            WebkitBackdropFilter:'blur(12px)',
            border:'1.5px solid rgba(255,255,255,0.80)',
            borderRadius:'var(--r-md)',
            boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <span style={{ color:'var(--text2)', fontSize:14, fontWeight:600 }}>{title}</span>
            <span style={{ fontSize:22, fontWeight:800, color:'var(--text)',
              letterSpacing:'-0.02em' }}>LKR {parseFloat(amount).toFixed(2)}</span>
          </div>

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
      ) : (
        <>
          {/* Expense summary chip */}
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'13px 16px', marginBottom:16,
            background:'rgba(255,255,255,0.55)',
            backdropFilter:'blur(12px)',
            WebkitBackdropFilter:'blur(12px)',
            border:'1.5px solid rgba(255,255,255,0.80)',
            borderRadius:'var(--r-md)',
            boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
          }}>
            <span style={{ color:'var(--text2)', fontSize:14, fontWeight:600 }}>{splitWith.length+1} people</span>
            <span style={{ fontSize:22, fontWeight:800, color:'var(--text)',
              letterSpacing:'-0.02em' }}>LKR {parseFloat(amount).toFixed(2)}</span>
          </div>

          <label style={{ display:'block', fontSize:11, fontWeight:700, color:'var(--text3)',
            textTransform:'uppercase', letterSpacing:'1px', marginBottom:10 }}>Split method</label>

          {/* Split mode selector */}
          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
            {[
              { id: 'equal', label: 'Equal Split', desc: 'Divide equally among all' },
              { id: 'percentage', label: 'By Percentage', desc: 'Assign percentages' },
              { id: 'custom', label: 'Custom Amount', desc: 'Enter amounts manually' }
            ].map(mode => (
              <div key={mode.id} onClick={()=>setSplitMode(mode.id)}
                style={{
                  padding:'12px 14px', borderRadius:'var(--r-md)',
                  border:`1.5px solid ${splitMode===mode.id ? '#1FD888' : 'rgba(255,255,255,0.75)'}`,
                  background: splitMode===mode.id
                    ? 'linear-gradient(135deg, rgba(31,216,136,0.15), rgba(31,216,136,0.10))'
                    : 'rgba(255,255,255,0.50)',
                  cursor:'pointer', transition:'all .18s',
                  boxShadow: splitMode===mode.id ? '0 4px 16px rgba(31,216,136,0.25)' : '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ fontWeight:700, fontSize:14, color:'var(--text)', marginBottom:2 }}>
                  {splitMode===mode.id?'✓':''} {mode.label}
                </div>
                <div style={{ fontSize:12, color:'var(--text3)' }}>{mode.desc}</div>
              </div>
            ))}
          </div>

          {/* Split mode content */}
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
                Assign percentages (total: {percentageTotal.toFixed(1)}%)
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div key="u1" style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', minWidth:40 }}>You</span>
                  <input type="number" min="0" max="100" placeholder="%" 
                    value={percentageSplits['u1'] || ''} 
                    onChange={e=>setPercentageSplits({...percentageSplits, 'u1': parseFloat(e.target.value) || 0})}
                    style={{
                      flex:1, height:36, padding:'0 8px', borderRadius:8,
                      border:'1.5px solid rgba(255,255,255,0.75)',
                      background:'rgba(255,255,255,0.50)', fontSize:12, fontFamily:'var(--font-body)',
                    }}
                  />
                  <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)', minWidth:50, textAlign:'right' }}>
                    LKR {((parseFloat(percentageSplits['u1'] || 0) / 100) * parseFloat(amount)).toFixed(2)}
                  </span>
                </div>
                {splitWith.map(fid => {
                  const f = friends.find(x=>x.id===fid)
                  return (
                    <div key={fid} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', minWidth:40 }}>{f.name.split(' ')[0]}</span>
                      <input type="number" min="0" max="100" placeholder="%" 
                        value={percentageSplits[fid] || ''} 
                        onChange={e=>setPercentageSplits({...percentageSplits, [fid]: parseFloat(e.target.value) || 0})}
                        style={{
                          flex:1, height:36, padding:'0 8px', borderRadius:8,
                          border:'1.5px solid rgba(255,255,255,0.75)',
                          background:'rgba(255,255,255,0.50)', fontSize:12, fontFamily:'var(--font-body)',
                        }}
                      />
                      <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)', minWidth:50, textAlign:'right' }}>
                        LKR {((parseFloat(percentageSplits[fid] || 0) / 100) * parseFloat(amount)).toFixed(2)}
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
                Enter amounts (total: LKR {customTotal.toFixed(2)})
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div key="u1" style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', minWidth:40 }}>You</span>
                  <input type="number" min="0" placeholder="0.00" 
                    value={customSplits['u1'] || ''} 
                    onChange={e=>setCustomSplits({...customSplits, 'u1': e.target.value})}
                    style={{
                      flex:1, height:36, padding:'0 8px', borderRadius:8,
                      border:'1.5px solid rgba(255,255,255,0.75)',
                      background:'rgba(255,255,255,0.50)', fontSize:12, fontFamily:'var(--font-body)',
                    }}
                  />
                  <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)', minWidth:30 }}>LKR</span>
                </div>
                {splitWith.map(fid => {
                  const f = friends.find(x=>x.id===fid)
                  return (
                    <div key={fid} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', minWidth:40 }}>{f.name.split(' ')[0]}</span>
                      <input type="number" min="0" placeholder="0.00" 
                        value={customSplits[fid] || ''} 
                        onChange={e=>setCustomSplits({...customSplits, [fid]: e.target.value})}
                        style={{
                          flex:1, height:36, padding:'0 8px', borderRadius:8,
                          border:'1.5px solid rgba(255,255,255,0.75)',
                          background:'rgba(255,255,255,0.50)', fontSize:12, fontFamily:'var(--font-body)',
                        }}
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
