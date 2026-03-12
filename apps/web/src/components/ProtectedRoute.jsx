import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    // Simple placeholder; can be replaced with a proper loader
    return (
      <div style={{ paddingTop:80, textAlign:'center', color:'var(--text2)' }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  // Support both element-wrapping and <Outlet/> usage
  if (children) {
    return children
  }

  return <Outlet />
}

