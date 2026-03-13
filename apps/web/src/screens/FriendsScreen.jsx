import React, { useState } from 'react'
import { Card, SectionLabel, Avatar, BalanceBadge, Button, EmptyState, BottomSheet, Input } from '../components/UI.jsx'

const COLORS = ['#1FD888','#e8a820','#3b82f6','#a78bfa','#f97316','#ec4899','#06b6d4']

export default function FriendsScreen({ friends, expenses, onSettle, onAddFriend }) {
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)
  const [showAdd, setShowAdd]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [addingFriendForm, setAddingFriendForm] = useState(false)
  const [newName, setNewName]   = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [showSettle, setShowSettle] = useState(false)
  const [settleAmount, setSettleAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')

  const handleSearch = (query) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    setSearching(true)
    // Simulate search API call - in real app, this would call backend
    setTimeout(() => {
      // Example: search by name or phone
      const queryLower = query.toLowerCase()
      const mockResults = [
        { id: 'ext1', name: 'Sara Ali', phone: '701234567', initials: 'SA', color: '#e8a820', isExisting: false },
        { id: 'ext2', name: 'Anil Kumar', phone: '702345678', initials: 'AK', color: '#3b82f6', isExisting: false },
        { id: 'ext3', name: 'Maria Santos', phone: '703456789', initials: 'MS', color: '#a78bfa', isExisting: false },
      ].filter(u => 
        u.name.toLowerCase().includes(queryLower) || 
        u.phone.includes(query)
      )
      setSearchResults(mockResults)
      setSearching(false)
    }, 300)
  }

  const handleAddFriendQuick = (result) => {
    onAddFriend({ 
      name: result.name, 
      initials: result.initials, 
      color: result.color,
      phone: result.phone 
    })
    setSearchQuery('')
    setSearchResults([])
    setShowAdd(false)
  }

  const handleCreateFriend = () => {
    if (!newName.trim()) return
    const initials = newName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const colors = ['#1FD888', '#e8a820', '#3b82f6', '#a78bfa', '#f97316', '#ec4899', '#06b6d4']
    const color = colors[Math.floor(Math.random() * colors.length)]
    onAddFriend({ 
      name: newName.trim(), 
      initials, 
      color,
      phone: newPhone || null 
    })
    setNewName('')
    setNewPhone('')
    setAddingFriendForm(false)
    setShowAdd(false)
  }

  const sf = selected ? friends.find(f=>f.id===selected) : null
  const friendExps = selected ? expenses.filter(e=>e.paidBy===selected||e.splitWith.includes(selected)) : []

  if(selected && sf) {
    return (
      <div style={{ flex:1, overflowY:'auto', paddingBottom:90, position:'relative', zIndex:1 }}>
        <div className="a1" style={{ padding:'52px 20px 16px' }}>
          <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none',
            color:'var(--accent)', fontSize:14, fontWeight:700, cursor:'pointer',
            padding:'0 0 12px', fontFamily:'var(--font-body)', display:'flex', alignItems:'center', gap:4 }}>
            ← Back
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <Avatar initials={sf.initials} color={sf.color} size={58}/>
            <div>
              <h1 style={{ fontSize:24, fontWeight:800, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:5 }}>{sf.name}</h1>
              <BalanceBadge value={sf.balance}/>
            </div>
          </div>
        </div>

        <div style={{ padding:'0 16px' }}>
          {sf.balance!==0 && (
            <div className="a2" style={{
              padding:'18px 18px',
              background: sf.balance>0
                ? 'linear-gradient(135deg, rgba(31,216,136,0.15), rgba(31,216,136,0.10))'
                : 'linear-gradient(135deg, rgba(210,50,20,0.12), rgba(255,100,60,0.08))',
              border:`1.5px solid ${sf.balance>0?'rgba(31,216,136,0.25)':'rgba(210,50,20,0.22)'}`,
              backdropFilter:'blur(16px)',
              WebkitBackdropFilter:'blur(16px)',
              borderRadius:'var(--r-lg)',
              display:'flex', justifyContent:'space-between', alignItems:'center',
              marginBottom:12,
              boxShadow:`0 6px 20px ${sf.balance>0?'rgba(31,216,136,0.12)':'rgba(210,50,20,0.10)'}`,
            }}>
              <div>
                <div style={{ fontSize:13, color:'var(--text2)', marginBottom:3, fontWeight:600 }}>
                  {sf.balance>0?`${sf.name} owes you`:`You owe ${sf.name}`}
                </div>
                <div style={{ fontSize:32, fontWeight:800, color:sf.balance>0?'var(--positive)':'var(--negative)',
                  letterSpacing:'-0.03em' }}>
                  LKR {Math.abs(sf.balance).toFixed(2)}
                </div>
              </div>
              <Button onClick={()=>{setSettleAmount(Math.abs(sf.balance).toString()); setShowSettle(true)}}
                variant={sf.balance>0?'primary':'danger'}
                style={{ width:'auto', padding:'10px 18px' }} size="sm">
                Settle Up ✓
              </Button>
            </div>
          )}
          {sf.balance===0 && (
            <div className="a2" style={{ textAlign:'center', padding:'12px', color:'var(--positive)',
              fontSize:14, fontWeight:700, marginBottom:12,
              background:'rgba(31,216,136,0.10)', borderRadius:'var(--r-md)',
              border:'1px solid rgba(31,216,136,0.20)' }}>
              🎉 All settled up!
            </div>
          )}

          <SectionLabel>Shared Expenses · {friendExps.length}</SectionLabel>
          {friendExps.length===0
            ? <EmptyState emoji="🤝" title="No shared expenses" subtitle="Add an expense to split with this friend"/>
            : friendExps.map(e=>{
              const youPaid = e.paidBy==='u1'
              const share = (e.amount/(e.splitWith.length+1)).toFixed(2)
              return (
                <Card key={e.id}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, marginBottom:2, color:'var(--text)' }}>{e.title}</div>
                      <div style={{ fontSize:12, color:'var(--text3)' }}>{e.date}</div>
                      <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>
                        {youPaid?'You paid':e.paidBy===sf.id?`${sf.name} paid`:'Someone paid'} · ${e.amount.toFixed(2)} total
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontWeight:800, fontSize:16,
                        color:youPaid?'var(--positive)':'var(--negative)' }}>
                        {youPaid?`+LKR ${(e.amount-parseFloat(share)).toFixed(2)}`:`-LKR ${share}`}
                      </div>
                      <div style={{ fontSize:11, color:'var(--text3)' }}>{youPaid?'lent':'borrowed'}</div>
                    </div>
                  </div>
                </Card>
              )
            })
          }
        </div>
      </div>
    )
  }

  const owed    = friends.filter(f=>f.balance>0)
  const owing   = friends.filter(f=>f.balance<0)
  const settled = friends.filter(f=>f.balance===0)

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:90, position:'relative', zIndex:1 }}>
      <div className="a1" style={{ padding:'52px 20px 12px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <h1 style={{ fontSize:28, fontWeight:800, color:'var(--text)', letterSpacing:'-0.03em' }}>Friends</h1>
          <button onClick={()=>setShowAdd(true)} style={{
            background:'linear-gradient(135deg,rgba(31,216,136,0.18),rgba(31,216,136,0.12))',
            backdropFilter:'blur(10px)',
            WebkitBackdropFilter:'blur(10px)',
            border:'1.5px solid rgba(31,216,136,0.30)',
            borderRadius:12, color:'var(--accent)',
            padding:'8px 14px', fontSize:13, fontWeight:800,
            cursor:'pointer', fontFamily:'var(--font-body)',
            boxShadow:'0 3px 10px rgba(31,216,136,0.20)',
            transition:'transform .12s',
          }}
          onMouseDown={e=>e.currentTarget.style.transform='scale(0.93)'}
          onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
          >+ Add</button>
        </div>
      </div>

      <div style={{ padding:'0 16px' }}>
        <div className="a2">
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="🔍  Search friends…"
            style={{
              width:'100%',
              background:'rgba(255,255,255,0.55)',
              backdropFilter:'blur(16px)',
              WebkitBackdropFilter:'blur(16px)',
              border:'1.5px solid rgba(255,255,255,0.82)',
              borderRadius:'var(--r-md)',
              color:'var(--text)', padding:'11px 14px',
              fontSize:14, outline:'none', marginBottom:14,
              fontFamily:'var(--font-body)',
              boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
              transition:'border-color .2s, box-shadow .2s',
            }}
            onFocus={e=>{e.target.style.borderColor='#1FD888';e.target.style.boxShadow='0 0 0 3px rgba(31,216,136,.25)'}}
            onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.82)';e.target.style.boxShadow='0 2px 8px rgba(0,0,0,0.05)'}}
          />
        </div>

        {owed.length>0 && (<>
          <SectionLabel className="a3">Owe You · LKR {owed.reduce((s,f)=>s+f.balance,0).toFixed(2)}</SectionLabel>
          {owed.filter(f=>f.name.toLowerCase().includes(search.toLowerCase())).map(f=>(
            <Card key={f.id} className="a4" onClick={()=>setSelected(f.id)}>
              <FriendRow friend={f}/>
            </Card>
          ))}
        </>)}

        {owing.length>0 && (<>
          <SectionLabel>You Owe · LKR {owing.reduce((s,f)=>s+Math.abs(f.balance),0).toFixed(2)}</SectionLabel>
          {owing.filter(f=>f.name.toLowerCase().includes(search.toLowerCase())).map(f=>(
            <Card key={f.id} onClick={()=>setSelected(f.id)}>
              <FriendRow friend={f}/>
            </Card>
          ))}
        </>)}

        {settled.length>0 && (<>
          <SectionLabel>Settled Up ✓</SectionLabel>
          {settled.filter(f=>f.name.toLowerCase().includes(search.toLowerCase())).map(f=>(
            <Card key={f.id} onClick={()=>setSelected(f.id)}>
              <FriendRow friend={f}/>
            </Card>
          ))}
        </>)}

        {friends.filter(f=>f.name.toLowerCase().includes(search.toLowerCase())).length===0 && search && (
          <EmptyState emoji="🔍" title="No results" subtitle={`No friend named "${search}"`}/>
        )}
      </div>

      <BottomSheet open={showAdd} onClose={()=>{ setShowAdd(false); setSearchQuery(''); setSearchResults([]); setAddingFriendForm(false); setNewName(''); setNewPhone(''); }} title="Add Friend">
        {!addingFriendForm ? (
          <>
            <Input 
              label="Search for a friend" 
              placeholder="By name or phone number"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              autoFocus
            />

            {searching && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text2)' }}>
                Searching...
              </div>
            )}

            {searchResults.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>
                  Search Results
                </div>
                {searchResults.map(result => (
                  <div
                    key={result.id}
                    onClick={() => handleAddFriendQuick(result)}
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
                    <Avatar initials={result.initials} color={result.color} size={38} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                        {result.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                        +94 {result.phone}
                      </div>
                    </div>
                    <div style={{ fontSize: 18, color: 'var(--accent)' }}>+</div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !searching && (
              <div style={{
                textAlign: 'center', padding: '20px 0',
                color: 'var(--text3)', fontSize: 13
              }}>
                <div style={{ marginBottom: 12 }}>No results found</div>
                <button
                  onClick={() => setAddingFriendForm(true)}
                  style={{
                    background: 'linear-gradient(135deg, #1FD888, #22c55e)',
                    border: 'none',
                    color: 'white',
                    padding: '10px 18px',
                    borderRadius: 'var(--r-md)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Create New Friend
                </button>
              </div>
            )}

            {!searchQuery && searchResults.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                color: 'var(--text3)',
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
                <div style={{ fontSize: 13, marginBottom: 16 }}>
                  Search by name or phone number
                </div>
                <button
                  onClick={() => setAddingFriendForm(true)}
                  style={{
                    background: 'rgba(255,255,255,0.60)',
                    backdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(255,255,255,0.80)',
                    color: 'var(--accent)',
                    padding: '10px 18px',
                    borderRadius: 'var(--r-md)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  Add Friend Manually
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <Input 
              label="Full Name" 
              placeholder="e.g. Sara Ali"
              value={newName} 
              onChange={e => setNewName(e.target.value)}
              autoFocus
            />
            <Input 
              label="Phone Number (Optional)" 
              placeholder="701234567"
              value={newPhone} 
              onChange={e => setNewPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Button 
                variant="secondary" 
                onClick={() => { setAddingFriendForm(false); setNewName(''); setNewPhone(''); }}
                style={{ flex: 1 }}
              >
                Back
              </Button>
              <Button 
                onClick={handleCreateFriend} 
                disabled={!newName.trim()}
                style={{ flex: 1 }}
              >
                Add Friend
              </Button>
            </div>
          </>
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

            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text3)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: 6
              }}>
                Payment Amount (LKR)
              </label>
              <div style={{ position: 'relative', marginBottom: 8 }}>
                <span style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text3)',
                  fontSize: 16,
                  fontWeight: 800
                }}>
                  LKR
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={settleAmount}
                  onChange={e => setSettleAmount(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.60)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1.5px solid rgba(255,255,255,0.80)',
                    borderRadius: 'var(--r-md)',
                    color: 'var(--text)',
                    padding: '13px 14px 13px 50px',
                    fontSize: 20,
                    fontWeight: 700,
                    outline: 'none',
                    fontFamily: 'var(--font-body)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    transition: 'border-color .2s, box-shadow .2s',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#1FD888'
                    e.target.style.boxShadow = '0 0 0 3px rgba(31,216,136,.25)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.80)'
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                />
              </div>
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
                }}
              >
                Pay full amount (LKR {Math.abs(sf.balance).toFixed(2)})
              </button>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{
                display: 'block',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text3)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: 8
              }}>
                Payment Method
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { id: 'cash', label: '💵 Cash' },
                  { id: 'bank', label: '🏦 Bank Transfer' },
                  { id: 'mobile', label: '📱 Mobile Payment' },
                  { id: 'other', label: '🔗 Other' },
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--r-md)',
                      border: `1.5px solid ${paymentMethod === method.id ? '#1FD888' : 'rgba(255,255,255,0.75)'}`,
                      background: paymentMethod === method.id
                        ? 'linear-gradient(135deg, rgba(31,216,136,0.15), rgba(31,216,136,0.10))'
                        : 'rgba(255,255,255,0.50)',
                      color: paymentMethod === method.id ? 'var(--accent)' : 'var(--text2)',
                      fontSize: 12,
                      fontWeight: paymentMethod === method.id ? 700 : 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-body)',
                      transition: 'all .18s',
                    }}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

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

function FriendRow({ friend:f }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
      <Avatar initials={f.initials} color={f.color} size={44}/>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:700, fontSize:15, color:'var(--text)' }}>{f.name}</div>
        <div style={{ fontSize:12, color:'var(--text3)', marginTop:1 }}>
          {f.balance===0?'All settled up ✓':f.balance>0?`Owes you LKR ${f.balance.toFixed(2)}`:`You owe LKR ${Math.abs(f.balance).toFixed(2)}`}
        </div>
      </div>
      <BalanceBadge value={f.balance}/>
    </div>
  )
}
