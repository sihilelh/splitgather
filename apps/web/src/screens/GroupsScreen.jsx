import React, { useState } from 'react'
import { Card, SectionLabel, Avatar, Button, EmptyState, BottomSheet, Input } from '../components/UI.jsx'
import BackButton from '../components/BackButton.jsx'
import BalanceHeroCard from '../components/BalanceHeroCard.jsx'
import ExpenseCard from '../components/ExpenseCard.jsx'
import GroupCard from '../components/GroupCard.jsx'

const EMOJIS = ['🏠','📚','☕','🎮','🏋️','🎵','🛒','✈️','🍕','🎉','🎓','💻']

export default function GroupsScreen({ groups, friends, expenses, onAddGroup }) {
  const [selected, setSelected] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmoji, setNewEmoji] = useState('🏠')

  const group = selected ? groups.find(g=>g.id===selected) : null
  const groupExps = selected ? expenses.filter(e=>e.groupId===selected) : []

  if(selected && group) {
    const memberObjs = [
      {id:'u1',name:'You',initials:'MM',color:'#1FD888'},
      ...friends.filter(f=>group.members.includes(f.id))
    ]
    return (
      <div style={{ flex:1, overflowY:'auto', paddingBottom:90, position:'relative', zIndex:1 }}>
        <div className="a1" style={{ padding:'52px 20px 16px' }}>
          <BackButton onClick={()=>setSelected(null)} />
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{
              fontSize:42, width:60, height:60,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:`linear-gradient(135deg,${group.color}30,${group.color}12)`,
              borderRadius:18, border:`2px solid ${group.color}40`,
              boxShadow:`0 6px 20px ${group.color}25`,
              animation:'float 4s ease-in-out infinite',
            }}>{group.emoji}</div>
            <div>
              <h1 style={{ fontSize:22, fontWeight:800, color:'var(--text)', letterSpacing:'-0.02em', marginBottom:3 }}>{group.name}</h1>
              <div style={{ fontSize:13, color:'var(--text3)' }}>{group.description}</div>
            </div>
          </div>
        </div>

        <div style={{ padding:'0 16px' }}>
          {/* Balance card */}
          <BalanceHeroCard
            title="Your Balance"
            balance={group.balance}
            color={group.color}
            style={{ padding:'20px', marginBottom:14 }}
          />

          {/* Members */}
          <SectionLabel>{memberObjs.length} Members</SectionLabel>
          <Card>
            <div style={{ display:'flex', flexWrap:'wrap', gap:14 }}>
              {memberObjs.map(m=>(
                <div key={m.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, minWidth:52 }}>
                  <Avatar initials={m.initials} color={m.color} size={44}/>
                  <span style={{ fontSize:11, color:'var(--text2)', textAlign:'center', fontWeight:600 }}>
                    {m.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Expenses */}
          <SectionLabel>Expenses · {groupExps.length}</SectionLabel>
          {groupExps.length===0
            ? <EmptyState emoji="💸" title="No expenses yet" subtitle="Add the first expense to this group"/>
            : groupExps.map(e=>(
              <ExpenseCard
                key={e.id}
                expense={e}
                friends={friends}
                currentUserId="u1"
                showBalance={false}
              />
            ))
          }
        </div>
      </div>
    )
  }

  return (
    <div style={{ flex:1, overflowY:'auto', paddingBottom:90, position:'relative', zIndex:1 }}>
      <div className="a1" style={{ padding:'52px 20px 16px' }}>
        <h1 style={{ fontSize:28, fontWeight:800, color:'var(--text)', letterSpacing:'-0.03em' }}>Groups</h1>
      </div>

      <div style={{ padding:'0 16px' }}>
        <div className="a2">
          <Button variant="ghost" onClick={()=>setShowCreate(true)} style={{ marginBottom:14 }}>
            ＋ Create New Group
          </Button>
        </div>

        <SectionLabel>Your Groups · {groups.length}</SectionLabel>

        {groups.length===0
          ? <EmptyState emoji="🏘" title="No groups yet" subtitle="Create a group to split expenses together"/>
          : groups.map((g,i)=>(
            <GroupCard
              key={g.id}
              group={g}
              expenseCount={expenses.filter(e=>e.groupId===g.id).length}
              onClick={()=>setSelected(g.id)}
            />
          ))
        }
      </div>

      {/* Create Group Sheet */}
      <BottomSheet open={showCreate} onClose={()=>setShowCreate(false)} title="Create Group">
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
          {EMOJIS.map(e=>(
            <button key={e} onClick={()=>setNewEmoji(e)} style={{
              fontSize:22, width:46, height:46, borderRadius:13,
              border:`2px solid ${newEmoji===e?'#1FD888':'rgba(31,216,136,0.22)'}`,
              background: newEmoji===e
                ? 'linear-gradient(135deg,rgba(31,216,136,0.18),rgba(31,216,136,0.12))'
                : 'rgba(255,255,255,0.45)',
              backdropFilter:'blur(8px)',
              cursor:'pointer',
              transition:'all .15s',
              boxShadow: newEmoji===e ? '0 3px 10px rgba(31,216,136,0.25)' : 'none',
            }}>{e}</button>
          ))}
        </div>
        <Input label="Group Name" placeholder="e.g. CS Dorm Floor 3"
          value={newName} onChange={e=>setNewName(e.target.value)}/>
        <Button
          onClick={()=>{
            onAddGroup({name:newName,emoji:newEmoji,description:'',color:'#1FD888',members:[]})
            setNewName('');setShowCreate(false)
          }}
          disabled={!newName.trim()}>Create Group</Button>
      </BottomSheet>
    </div>
  )
}
