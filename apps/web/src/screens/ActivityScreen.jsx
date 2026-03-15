import React, { useState } from 'react'
import { SectionLabel, EmptyState, Pill } from '../components/UI.jsx'
import FloatingActionButton from '../components/FloatingActionButton.jsx'
import ExpenseCard from '../components/ExpenseCard.jsx'
import EditExpenseModal from '../components/EditExpenseModal.jsx'
import { useRecords } from '../hooks/useRecords.jsx'
import { useAuth } from '../hooks/useAuth.jsx'
import { useFriends } from '../hooks/useFriends.jsx'

const FILTERS = [
  {id:'all',    label:'All'},
  {id:'paid',   label:'You paid'},
  {id:'owe',    label:'You owe'},
  {id:'food',   label:'🍕 Food'},
  {id:'edu',    label:'📖 Edu'},
  {id:'travel', label:'🚗 Travel'},
]

export default function ActivityScreen({ expenses: expensesProp, friends: friendsProp, groups, onAddExpense, onExpenseUpdate }) {
  const { user } = useAuth()
  const { friends: friendsData } = useFriends()
  const { expenses: recordsExpenses, updateRecord, refreshRecords } = useRecords()
  const [filter, setFilter] = useState('all')
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  
  // Use expenses from prop if provided, otherwise from useRecords
  const expenses = expensesProp || recordsExpenses || []
  const friends = friendsProp || friendsData || []
  const currentUserId = user ? String(user.id) : 'u1'
  
  const getName = id => {
    if (String(id) === String(currentUserId)) return 'You'
    return friends.find(f=>String(f.id) === String(id))?.name||'?'
  }

  const filtered = expenses.filter(e=>{
    if(!e) return false
    if(filter==='paid')   return String(e.paidBy) === String(currentUserId)
    if(filter==='owe')    return String(e.paidBy) !== String(currentUserId) && (e.splitWith || []).includes(currentUserId)
    if(filter==='food')   return e.category==='food'
    if(filter==='edu')    return e.category==='education'
    if(filter==='travel') return e.category==='transport'
    return true
  })

  const sorted = [...filtered].sort((a,b)=>(b.date || '').localeCompare(a.date || ''))

  const grouped = sorted.reduce((acc,e)=>{
    if(!e.date) return acc
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
                  currentUserId={currentUserId || "u1"}
                  showBalance={true}
                  showCategoryBadge={true}
                  showPeopleCount={true}
                  onClick={() => {
                    setSelectedExpense(e)
                    setShowEditModal(true)
                  }}
                />
              ))}
            </div>
          ))
        }
      </div>

      {/* FAB */}
      <FloatingActionButton onClick={onAddExpense} />

      {/* Edit Expense Modal */}
      {selectedExpense && (
        <EditExpenseModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedExpense(null)
          }}
          record={selectedExpense}
          friends={friends}
          groups={groups || []}
          currentUserId={currentUserId || "u1"}
          onUpdate={async (recordId, updateData) => {
            try {
              await updateRecord(recordId, updateData)
              await refreshRecords()
              if (onExpenseUpdate) {
                onExpenseUpdate(recordId, updateData)
              }
              setShowEditModal(false)
              setSelectedExpense(null)
            } catch (err) {
              console.error('Failed to update expense:', err)
              alert(err.message || 'Failed to update expense')
            }
          }}
        />
      )}
    </div>
  )
}
