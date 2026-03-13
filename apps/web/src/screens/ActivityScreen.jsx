import React, { useState } from 'react'
import { Card, SectionLabel, CategoryIcon, EmptyState, Pill } from '../components/UI.jsx'
import { CATEGORY_META } from '../data/mockData.js'

const FILTERS = [
  {id:'all',    label:'All'},
  {id:'paid',   label:'You paid'},
  {id:'owe',    label:'You owe'},
  {id:'food',   label:'🍕 Food'},
  {id:'edu',    label:'📖 Edu'},
  {id:'travel', label:'🚗 Travel'},
]

export default function ActivityScreen({ expenses, friends, onAddExpense }) {
  const [filter, setFilter] = useState('all')
  const getName = id => id==='u1'?'You':friends.find(f=>f.id===id)?.name||'?'

  const filtered = expenses.filter(e=>{
    if(filter==='paid')   return e.paidBy==='u1'
    if(filter==='owe')    return e.paidBy!=='u1'&&e.splitWith.includes('u1')
    if(filter==='food')   return e.category==='food'
    if(filter==='edu')    return e.category==='education'
    if(filter==='travel') return e.category==='transport'
    return true
  })

  const sorted = [...filtered].sort((a,b)=>b.date.localeCompare(a.date))

  const grouped = sorted.reduce((acc,e)=>{
    const d=new Date(e.date), now=new Date()
    const diff=Math.floor((now-d)/86400000)
    const label=diff===0?'Today':diff===1?'Yesterday':diff<7?`${diff} days ago`:e.date
    if(!acc[label]) acc[label]=[]
    acc[label].push(e)
    return acc
  },{})

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:90, position:'relative', zIndex:1 }}>
      <div className="a1" style={{ padding:'52px 20px 0' }}>
        <h1 style={{ fontSize:28, fontWeight:800, color:'var(--text)', letterSpacing:'-0.03em', marginBottom:14 }}>
          Activity
        </h1>
        {/* Filter pills */}
        <div style={{ display:'flex', gap:7, overflowX:'auto', paddingBottom:14 }}>
          {FILTERS.map(f=>(
            <Pill key={f.id} active={filter===f.id} onClick={()=>setFilter(f.id)}>{f.label}</Pill>
          ))}
        </div>
      </div>

      <div style={{ padding:'0 16px' }}>
        {sorted.length===0
          ? <EmptyState emoji="📋" title="No expenses yet" subtitle="Tap + to add your first expense"/>
          : Object.entries(grouped).map(([label,items],gi)=>(
            <div key={label}>
              <SectionLabel>{label}</SectionLabel>
              {items.map((e,i)=>{
                const meta = CATEGORY_META[e.category]||CATEGORY_META.other
                const youPaid = e.paidBy==='u1'
                const youOwe  = !youPaid&&e.splitWith.includes('u1')
                const per = (e.amount/(e.splitWith.length+1)).toFixed(2)
                return (
                  <Card key={e.id} className={`a${Math.min(i+2,6)}`}>
                    <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                      <CategoryIcon meta={meta} size={46}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:800, fontSize:15, color:'var(--text)', marginBottom:2 }}>{e.title}</div>
                        <div style={{ fontSize:12, color:'var(--text3)', marginBottom:5 }}>
                          {getName(e.paidBy)} paid · {e.splitWith.length+1} people
                        </div>
                        <span style={{ fontSize:11, background:`${meta.color}18`,
                          color:meta.color, padding:'2px 9px', borderRadius:999,
                          fontWeight:700, border:`1px solid ${meta.color}30` }}>
                          {meta.emoji} {meta.label}
                        </span>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontWeight:800, fontSize:17, color:'var(--text)',
                          letterSpacing:'-0.02em' }}>${e.amount.toFixed(2)}</div>
                        {(youPaid||youOwe) && (
                          <div style={{ fontSize:13, fontWeight:800, marginTop:2,
                            color:youPaid?'var(--positive)':'var(--negative)' }}>
                            {youPaid?`+LKR ${(e.amount-parseFloat(per)).toFixed(2)}`:`-LKR ${per}`}
                          </div>
                        )}
                        {!youPaid&&!youOwe && <div style={{ fontSize:11, color:'var(--text3)' }}>not involved</div>}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ))
        }
      </div>

      {/* FAB */}
      <button onClick={onAddExpense} style={{
        position:'fixed', bottom:20, right:24, width:58, height:58,
        borderRadius:'50%',
        background:'linear-gradient(135deg,#1FD888,#4BE5A0)',
        border:'2px solid rgba(255,255,255,0.70)',
        color:'#0a0a0a', fontSize:26, cursor:'pointer',
        boxShadow:'0 8px 28px rgba(140,200,30,0.45)',
        display:'flex', alignItems:'center', justifyContent:'center',
        zIndex:150, transition:'transform .15s',
        fontFamily:'var(--font-body)',
        animation:'float 4s ease-in-out infinite',
      }}
      onMouseDown={e=>{e.currentTarget.style.transform='scale(0.90)';e.currentTarget.style.animation='none'}}
      onMouseUp={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.animation='float 4s ease-in-out infinite'}}
      >＋</button>
    </div>
  )
}
