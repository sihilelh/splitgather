import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, SectionLabel, Avatar, BalanceBadge, CategoryIcon } from '../components/UI.jsx'
import { CATEGORY_META } from '../data/mockData.js'

export default function HomeScreen({ currentUser, friends, groups, expenses, totalOwed, totalOwe, netBalance, onAddExpense }) {
  const navigate = useNavigate()
  const recent = [...expenses].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,4)
  const getName = id => id==='u1'?'You':friends.find(f=>f.id===id)?.name||'?'
  const hour = new Date().getHours()
  const greeting = hour<12?'Good morning ☀️':hour<17?'Good afternoon 🌤':'Good evening 🌙'

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:90, position:'relative', zIndex:1 }}>
      {/* Header */}
      <div className="a1" style={{ padding:'52px 20px 16px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:13, color:'var(--text3)', marginBottom:3, fontWeight:500 }}>{greeting}</div>
            <h1 style={{ fontSize:28, fontWeight:800, color:'var(--text)', letterSpacing:'-0.03em', lineHeight:1.1 }}>
              Hey, {currentUser.name.split(' ')[0]} 👋
            </h1>
          </div>
          <div style={{ position:'relative' }}>
            <div style={{
              position:'absolute', inset:-4, borderRadius:'50%',
              background:'linear-gradient(135deg,#1FD888,#4BE5A0)',
              animation:'pulseRing 2.5s ease-out infinite',
              opacity:0,
            }}/>
            <Avatar initials={currentUser.initials} color="#1FD888" size={50}/>
          </div>
        </div>

        {/* Net balance hero card */}
        <div className="a2" style={{
          background:'linear-gradient(135deg, rgba(31,216,136,0.30) 0%, rgba(31,216,136,0.22) 50%, rgba(31,216,136,0.15) 100%)',
          backdropFilter:'blur(24px) saturate(1.8)',
          WebkitBackdropFilter:'blur(24px) saturate(1.8)',
          border:'1.5px solid rgba(255,255,255,0.85)',
          borderRadius:'var(--r-xl)', padding:'22px 22px 20px',
          boxShadow:'0 12px 40px rgba(31,216,136,0.15), 0 3px 10px rgba(0,0,0,0.06)',
          position:'relative', overflow:'hidden',
        }}>
          {/* decorative blobs */}
          <div style={{ position:'absolute', top:-30, right:-30, width:120, height:120,
            background:'radial-gradient(circle,rgba(255,255,255,0.35) 0%,transparent 70%)',
            pointerEvents:'none' }}/>
          <div style={{ position:'absolute', bottom:-20, left:20, width:80, height:80,
            background:'radial-gradient(circle,rgba(31,216,136,0.25) 0%,transparent 70%)',
            pointerEvents:'none' }}/>

          <div style={{ fontSize:11, color:'var(--text3)', fontWeight:700,
            textTransform:'uppercase', letterSpacing:'1.2px', marginBottom:5 }}>Net Balance</div>
          <div style={{ fontSize:46, fontWeight:800, color: netBalance>=0?'var(--accent)':'var(--negative)',
            letterSpacing:'-0.04em', lineHeight:1, marginBottom:14 }}>
            {netBalance>=0?'+':''}{Math.abs(netBalance).toFixed(2)}
            <span style={{ fontSize:20 }}> USD</span>
          </div>
          <div style={{ display:'flex', gap:20 }}>
            <div>
              <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, marginBottom:1 }}>Owed to you</div>
              <div style={{ fontSize:16, fontWeight:800, color:'var(--positive)' }}>+Rs.{totalOwed.toFixed(2)}</div>
            </div>
            <div style={{ width:1, background:'rgba(112,112,112,0.15)' }}/>
            <div>
              <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600, marginBottom:1 }}>You owe</div>
              <div style={{ fontSize:16, fontWeight:800, color:'var(--negative)' }}>-Rs.{totalOwe.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'0 16px' }}>
        {/* Quick actions */}
        <div className="a3" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:6 }}>
          <button onClick={onAddExpense} style={{
            background:'linear-gradient(135deg,#1FD888,#4BE5A0)',
            border:'1.5px solid rgba(255,255,255,0.70)',
            borderRadius:'var(--r-md)', padding:'16px 14px', cursor:'pointer',
            display:'flex', alignItems:'center', gap:9,
            fontFamily:'var(--font-body)',
            boxShadow:'0 6px 20px rgba(31,216,136,0.30)',
            transition:'transform .12s, box-shadow .2s',
          }}
          onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'}
          onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
          >
            <span style={{ fontSize:22 }}>＋</span>
            <span style={{ fontWeight:800, fontSize:14, color:'#0a0a0a' }}>Add Expense</span>
          </button>
          <button onClick={()=>navigate('/friends')} style={{
            background:'rgba(255,255,255,0.55)',
            backdropFilter:'blur(16px)',
            WebkitBackdropFilter:'blur(16px)',
            border:'1.5px solid rgba(255,255,255,0.80)',
            borderRadius:'var(--r-md)', padding:'16px 14px', cursor:'pointer',
            display:'flex', alignItems:'center', gap:9,
            fontFamily:'var(--font-body)',
            boxShadow:'0 4px 14px rgba(0,0,0,0.06)',
            transition:'transform .12s',
          }}
          onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'}
          onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
          onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
          >
            <span style={{ fontSize:22 }}>🤝</span>
            <span style={{ fontWeight:800, fontSize:14, color:'var(--text)' }}>Settle Up</span>
          </button>
        </div>

        {/* Who owes you */}
        {friends.filter(f=>f.balance>0).length>0 && (
          <div className="a4">
            <SectionLabel>Owe You 💚</SectionLabel>
            <div style={{ display:'flex', gap:10, overflowX:'auto', paddingBottom:4 }}>
              {friends.filter(f=>f.balance>0).map(f=>(
                <div key={f.id} onClick={()=>navigate('/friends')} style={{
                  flexShrink:0, cursor:'pointer',
                  background:'rgba(255,255,255,0.52)',
                  backdropFilter:'blur(16px)',
                  WebkitBackdropFilter:'blur(16px)',
                  border:'1.5px solid rgba(255,255,255,0.82)',
                  borderRadius:'var(--r-md)', padding:'12px 14px',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                  minWidth:80,
                  boxShadow:'0 4px 14px rgba(0,0,0,0.05)',
                  transition:'transform .12s',
                }}
                onMouseDown={e=>e.currentTarget.style.transform='scale(0.93)'}
                onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
                >
                  <Avatar initials={f.initials} color={f.color} size={38}/>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text2)' }}>{f.name.split(' ')[0]}</div>
                  <div style={{ fontSize:12, fontWeight:800, color:'var(--positive)' }}>+Rs.{f.balance.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Groups */}
        <div className="a4">
          <SectionLabel>
            Groups
            <button onClick={()=>navigate('/groups')} style={{ background:'none', border:'none',
              color:'var(--accent)', fontSize:13, cursor:'pointer',
              fontFamily:'var(--font-body)', fontWeight:700 }}>See all →</button>
          </SectionLabel>
          {groups.slice(0,2).map(g=>(
            <Card key={g.id} onClick={()=>navigate('/groups')}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{
                  fontSize:26, width:46, height:46,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background:`linear-gradient(135deg, ${g.color}28, ${g.color}12)`,
                  borderRadius:14, border:`1.5px solid ${g.color}35`,
                  boxShadow:`0 3px 10px ${g.color}20`, flexShrink:0,
                }}>{g.emoji}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:'var(--text)' }}>{g.name}</div>
                  <div style={{ fontSize:12, color:'var(--text3)', marginTop:1 }}>{g.members.length+1} members</div>
                </div>
                <BalanceBadge value={g.balance}/>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent */}
        <div className="a5">
          <SectionLabel>
            Recent
            <button onClick={()=>navigate('/activity')} style={{ background:'none', border:'none',
              color:'var(--accent)', fontSize:13, cursor:'pointer',
              fontFamily:'var(--font-body)', fontWeight:700 }}>See all →</button>
          </SectionLabel>
          {recent.map(e=>{
            const meta = CATEGORY_META[e.category]||CATEGORY_META.other
            const youPaid = e.paidBy==='u1'
            const per = (e.amount/(e.splitWith.length+1)).toFixed(2)
            return (
              <Card key={e.id}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <CategoryIcon meta={meta} size={42}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'var(--text)' }}>{e.title}</div>
                    <div style={{ fontSize:12, color:'var(--text3)' }}>{getName(e.paidBy)} · {e.date}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:800, fontSize:15,
                      color:youPaid?'var(--positive)':'var(--negative)' }}>
                      {youPaid?`+Rs.${(e.amount-parseFloat(per)).toFixed(2)}`:`-Rs.${per}`}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text3)' }}>{youPaid?'lent':'owe'}</div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* FAB */}
      <button onClick={onAddExpense} style={{
        position:'fixed', bottom:20, right:24,
        width:58, height:58, borderRadius:'50%',
        background:'linear-gradient(135deg,#1FD888,#4BE5A0)',
        border:'2px solid rgba(31,216,136,0.70)',
        color:'#0a0a0a', fontSize:28, cursor:'pointer',
        boxShadow:'0 8px 28px rgba(31,216,136,0.45)',
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:150, transition:'transform .15s, box-shadow .2s',
        fontFamily:'var(--font-body)',
        animation:'float 4s ease-in-out infinite',
      }}
      onMouseDown={e=>{e.currentTarget.style.transform='scale(0.90)';e.currentTarget.style.animation='none'}}
      onMouseUp={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.animation='float 4s ease-in-out infinite'}}
      >＋</button>
    </div>
  )
}
