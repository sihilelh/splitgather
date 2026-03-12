import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { login as apiLogin, register as apiRegister, getCurrentUser, logout as apiLogout, getStoredToken, AuthError } from '../api/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initialising, setInitialising] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState(null)

  // bootstrap from localStorage token
  useEffect(() => {
    let isMounted = true
    const token = getStoredToken()
    if (!token) {
      setInitialising(false)
      return
    }
    ;(async () => {
      try {
        const me = await getCurrentUser()
        if (isMounted) {
          setUser(me)
        }
      } catch (err) {
        if (err instanceof AuthError) {
          // token invalid; user stays null
        } else {
          console.error('Failed to fetch current user', err)
        }
      } finally {
        if (isMounted) setInitialising(false)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const handleLogin = useCallback(async (credentials) => {
    setAuthLoading(true)
    setError(null)
    try {
      const me = await apiLogin(credentials)
      setUser(me)
      return { user: me, error: null }
    } catch (err) {
      const message =
        (err && err.message) ||
        'Unable to log in. Please try again.'
      setError(message)
      return { user: null, error: message }
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const handleRegister = useCallback(async (payload) => {
    setAuthLoading(true)
    setError(null)
    try {
      const me = await apiRegister(payload)
      setUser(me)
      return { user: me, error: null }
    } catch (err) {
      const message =
        (err && err.message) ||
        'Unable to register. Please try again.'
      setError(message)
      return { user: null, error: message }
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const handleLogout = useCallback(() => {
    apiLogout()
    setUser(null)
  }, [])

  const refreshMe = useCallback(async () => {
    try {
      const me = await getCurrentUser()
      setUser(me)
      return me
    } catch (err) {
      if (err instanceof AuthError) {
        setUser(null)
      }
      throw err
    }
  }, [])

  const value = {
    user,
    loading: initialising || authLoading,
    authLoading,
    initialising,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshMe,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}

