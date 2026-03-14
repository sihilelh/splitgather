import React, { useState } from 'react'
import { SectionLabel, EmptyState, Pill } from '../components/UI.jsx'
import FloatingActionButton from '../components/FloatingActionButton.jsx'
import ExpenseCard from '../components/ExpenseCard.jsx'

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
              {items.map((e,i)=>(
                <ExpenseCard
                  key={e.id}
                  expense={e}
                  friends={friends}
                  currentUserId="u1"
                  showBalance={true}
                  showCategoryBadge={true}
                  showPeopleCount={true}
                />
              ))}
            </div>
          ))
        }
      </div>

      {/* FAB */}
      <FloatingActionButton onClick={onAddExpense} />
    </div>
  )
}
