import React, { useState, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useStore } from './hooks/useStore.js'
import { useTheme } from './hooks/useTheme.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import TopNav from './components/TopNav.jsx'
import BottomNav from './components/BottomNav.jsx'
import AddExpenseModal from './components/AddExpenseModal.jsx'
import { Toast, BgOrbs } from './components/UI.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import HomeScreen     from './screens/HomeScreen.jsx'
import GroupsScreen   from './screens/GroupsScreen.jsx'
import FriendsScreen  from './screens/FriendsScreen.jsx'
import ActivityScreen from './screens/ActivityScreen.jsx'
import AccountScreen  from './screens/AccountScreen.jsx'
import LoginScreen    from './screens/LoginScreen.jsx'
import RegisterScreen from './screens/RegisterScreen.jsx'

function AppContent() {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast]     = useState(null)

  const {
    currentUser, friends, groups, expenses,
    totalOwed, totalOwe, netBalance,
    addExpense, settleWithFriend, addFriend, addGroup,
  } = useStore()

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(()=>setToast(null), 3200)
  }

  const handleAddExpense = useCallback((data) => {
    addExpense(data)
    showToast(`"${data.title}" added · Rs.${(data.amount/(data.splitWith.length+1)).toFixed(2)} each`)
  }, [addExpense])

  const handleSettle = useCallback((friendId) => {
    settleWithFriend(friendId)
    const name = friends.find(f=>f.id===friendId)?.name||'Friend'
    showToast(`Settled up with ${name} 🎉`)
  }, [settleWithFriend, friends])

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', position:'relative' }}>
      <BgOrbs/>

      <TopNav currentPath={location.pathname}/>
      <BottomNav currentPath={location.pathname}/>

      <div style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column', position:'relative', zIndex:1, marginTop:72, marginBottom:80 }}>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomeScreen
                  currentUser={currentUser}
                  friends={friends}
                  groups={groups}
                  expenses={expenses}
                  totalOwed={totalOwed}
                  totalOwe={totalOwe}
                  netBalance={netBalance}
                  onAddExpense={()=>setShowAdd(true)}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <GroupsScreen
                  groups={groups}
                  friends={friends}
                  expenses={expenses}
                  onAddGroup={addGroup}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <FriendsScreen
                  friends={friends}
                  expenses={expenses}
                  onSettle={handleSettle}
                  onAddFriend={addFriend}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity"
            element={
              <ProtectedRoute>
                <ActivityScreen
                  expenses={expenses}
                  friends={friends}
                  onAddExpense={()=>setShowAdd(true)}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountScreen
                  currentUser={currentUser}
                  friends={friends}
                  expenses={expenses}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>

      <AddExpenseModal open={showAdd} onClose={()=>setShowAdd(false)}
        friends={friends} groups={groups} onAdd={handleAddExpense}/>

      <Toast message={toast}/>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position:'fixed', top:16, right:24, zIndex:250,
          height:44,
          paddingLeft:12, paddingRight:12,
          minWidth:110,
          borderRadius:22,
          background:'var(--glass-bg)',
          backdropFilter:'blur(24px) saturate(1.9)',
          WebkitBackdropFilter:'blur(24px) saturate(1.9)',
          border:'1.5px solid var(--glass-border)',
          boxShadow:'var(--glass-shadow)',
          display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          fontSize:13, cursor:'pointer',
          transition:'transform .15s, box-shadow .2s, background .3s, border-color .3s',
          color:'var(--accent)',
          fontWeight:700,
          fontFamily:'var(--font-body)',
          letterSpacing:'-0.01em',
        }}
        onMouseDown={e => e.currentTarget.style.transform='scale(0.92)'}
        onMouseUp={e => e.currentTarget.style.transform='scale(1)'}
        onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
        title={theme === 'light' ? 'Switch to Night Mode' : 'Switch to Light Mode'}
      >
        {theme === 'light' ? <>🌙 <span>Night</span></> : <>☀️ <span>Light</span></>}
      </button>
    </div>
  )
}

import { ThemeProvider } from './hooks/useTheme.jsx'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
