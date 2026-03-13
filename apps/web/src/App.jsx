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
    showToast(`"${data.title}" added · LKR ${(data.amount/(data.splitWith.length+1)).toFixed(2)} each`)
  }, [addExpense])

  const handleSettle = useCallback((friendId, paymentDetails) => {
    settleWithFriend(friendId)
    const name = friends.find(f=>f.id===friendId)?.name||'Friend'
    const message = paymentDetails
      ? `Paid LKR ${paymentDetails.amount.toFixed(2)} to ${name} via ${paymentDetails.method} 🎉`
      : `Settled up with ${name} 🎉`
    showToast(message)
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
