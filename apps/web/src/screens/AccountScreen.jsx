import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, SectionLabel, Avatar, Button } from '../components/UI.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { CATEGORY_META } from '../data/mockData.js'

const MENU = [
  { icon:'📧', label:'Email settings',       section:'Preferences' },
  { icon:'🔔', label:'Notifications',         section:'Preferences' },
  { icon:'🔒', label:'Security',             section:'Preferences' },
  { icon:'🎨', label:'Appearance',           section:'Preferences' },
  { icon:'⭐', label:'Rate UniSplit',         section:'Feedback' },
  { icon:'💬', label:'Send Feedback',        section:'Feedback' },
  { icon:'❓', label:'Help & Support',       section:'Feedback' },
]

export default function AccountScreen({ currentUser, friends, expenses }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const displayUser = user || currentUser
  const totalSpent   = expenses.reduce((s,e)=>s+e.amount, 0)
  const youPaidCount = expenses.filter(e=>e.paidBy==='u1').length

  const catBreak = expenses
    .filter(e=>e.paidBy==='u1'||e.splitWith.includes('u1'))
    .reduce((acc,e)=>{
      const share = e.amount/(e.splitWith.length+1)
      acc[e.category] = (acc[e.category]||0)+share
      return acc
    },{})
  const topCats = Object.entries(catBreak).sort((a,b)=>b[1]-a[1]).slice(0,4)
  const total = Object.values(catBreak).reduce((s,v)=>s+v,0)

  const sections = [...new Set(MENU.map(m=>m.section))]

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:90, position:'relative', zIndex:1 }}>
      <div className="a1" style={{ padding:'52px 20px 20px' }}>
        <h1 style={{ fontSize:28, fontWeight:800, color:'var(--text)', letterSpacing:'-0.03em', marginBottom:20 }}>
          Account
        </h1>

        {/* Profile hero */}
        <div style={{
          background:'linear-gradient(135deg, rgba(31,216,136,0.25) 0%, rgba(31,216,136,0.18) 50%, rgba(31,216,136,0.12) 100%)',
          backdropFilter:'blur(22px) saturate(1.8)',
          WebkitBackdropFilter:'blur(22px) saturate(1.8)',
          border:'1.5px solid rgba(255,255,255,0.85)',
          borderRadius:'var(--r-xl)', padding:'20px',
          boxShadow:'0 10px 36px rgba(31,216,136,0.12)',
          position:'relative', overflow:'hidden',
        }}>
          <div style={{ position:'absolute', top:-30, right:-30, width:130, height:130,
            background:'radial-gradient(circle,rgba(255,255,255,0.32) 0%,transparent 70%)',
            pointerEvents:'none' }}/>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ position:'relative' }}>
              <Avatar initials={currentUser.initials} color="#1FD888" size={62}/>
              <div style={{
                position:'absolute', bottom:0, right:0, width:24, height:24,
                background:'rgba(255,255,255,0.85)',
                backdropFilter:'blur(8px)',
                border:'1.5px solid rgba(255,255,255,0.90)',
                borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11,
                boxShadow:'0 2px 8px rgba(0,0,0,0.08)',
              }}>📷</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:20, fontWeight:800, color:'var(--text)', letterSpacing:'-0.02em' }}>
                {displayUser?.name || currentUser.name}
              </div>
              <div style={{ fontSize:13, color:'var(--text2)', marginTop:2 }}>
                {displayUser?.email || currentUser.email}
              </div>
            </div>
            <button style={{
              background:'rgba(255,255,255,0.60)',
              backdropFilter:'blur(10px)',
              border:'1.5px solid rgba(255,255,255,0.85)',
              borderRadius:10, color:'var(--accent)',
              padding:'8px 14px', fontSize:13, fontWeight:800,
              cursor:'pointer', fontFamily:'var(--font-body)',
              boxShadow:'0 2px 8px rgba(0,0,0,0.06)',
            }}>Edit</button>
          </div>
        </div>
      </div>

      <div style={{ padding:'0 16px' }}>
        {/* Stats */}
        <div className="a2" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:9, marginBottom:20 }}>
          {[
            {label:'Friends',  value:friends.length,           color:'#3b82f6'},
            {label:'Paid',     value:youPaidCount,             color:'var(--positive)'},
            {label:'Total $',  value:`$${totalSpent.toFixed(0)}`, color:'var(--gold)'},
          ].map(s=>(
            <div key={s.label} style={{
              background:'rgba(255,255,255,0.52)',
              backdropFilter:'blur(16px)',
              WebkitBackdropFilter:'blur(16px)',
              border:'1.5px solid rgba(255,255,255,0.80)',
              borderRadius:'var(--r-md)', padding:'15px 10px', textAlign:'center',
              boxShadow:'0 4px 14px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize:22, fontWeight:800, color:s.color,
                letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:11, color:'var(--text3)', fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Spending breakdown */}
        {topCats.length>0 && (
          <div className="a3">
            <SectionLabel>Spending Breakdown</SectionLabel>
            <Card>
              {topCats.map(([cat,amt])=>{
                const meta = CATEGORY_META[cat]||CATEGORY_META.other
                const pct = (amt/total)*100
                return (
                  <div key={cat} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:17 }}>{meta.emoji}</span>
                        <span style={{ fontSize:14, fontWeight:700, color:'var(--text)' }}>{meta.label}</span>
                      </div>
                      <span style={{ fontSize:14, fontWeight:800, color:meta.color }}>${amt.toFixed(2)}</span>
                    </div>
                    <div style={{ height:6, background:'rgba(31,216,136,0.12)', borderRadius:6, overflow:'hidden' }}>
                      <div style={{
                        height:'100%',
                        width:`${pct}%`,
                        background:`linear-gradient(90deg,${meta.color},${meta.color}aa)`,
                        borderRadius:6,
                        boxShadow:`0 2px 6px ${meta.color}40`,
                        animation:`barGrow .8s cubic-bezier(.22,1,.36,1) both`,
                        '--w':`${pct}%`,
                      }}/>
                    </div>
                  </div>
                )
              })}
            </Card>
          </div>
        )}

        {/* Settings */}
        {sections.map((sec,si)=>(
          <div key={sec} className={`a${Math.min(si+4,6)}`}>
            <SectionLabel>{sec}</SectionLabel>
            {MENU.filter(m=>m.section===sec).map(item=>(
              <Card key={item.label} onClick={()=>{}}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:18, width:28, textAlign:'center' }}>{item.icon}</span>
                  <span style={{ flex:1, fontSize:15, fontWeight:600, color:'var(--text)' }}>{item.label}</span>
                  <span style={{ color:'var(--text3)', fontSize:18 }}>›</span>
                </div>
              </Card>
            ))}
          </div>
        ))}

        <div style={{ marginTop:8, marginBottom:20 }}>
          <Button
            variant="danger"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
          >
            Log Out
          </Button>
        </div>

        <div style={{ textAlign:'center', paddingBottom:20, color:'var(--text3)', fontSize:12, fontWeight:500 }}>
          UniSplit v1.0 · Made for uni students 🎓
        </div>
      </div>
    </div>
  )
}
