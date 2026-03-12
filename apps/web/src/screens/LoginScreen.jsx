import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

export default function LoginScreen() {
  const { login, error, authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/'

  async function handleSubmit(e) {
    e.preventDefault()
    setLocalError(null)
    const { error: err } = await login({ email, password })
    if (err) {
      setLocalError(err)
      return
    }
    navigate(from, { replace: true })
  }

  const displayError = localError || error

  return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'80px 16px 40px' }}>
      <div style={{
        width:'100%',
        maxWidth:420,
        background:'var(--card-bg)',
        borderRadius:'var(--r-xl)',
        padding:'24px 22px 26px',
        boxShadow:'var(--glass-shadow)',
        border:'1.5px solid var(--glass-border)',
        backdropFilter:'blur(22px) saturate(1.8)',
        WebkitBackdropFilter:'blur(22px) saturate(1.8)',
      }}>
        <h1 style={{ fontSize:24, fontWeight:800, marginBottom:8, color:'var(--text)', letterSpacing:'-0.03em' }}>
          Welcome back 👋
        </h1>
        <p style={{ fontSize:13, color:'var(--text2)', marginBottom:18 }}>
          Sign in to continue splitting expenses with your friends.
        </p>

        {displayError && (
          <div style={{
            marginBottom:14,
            padding:'9px 10px',
            borderRadius:10,
            background:'rgba(248,113,113,0.08)',
            border:'1px solid rgba(248,113,113,0.55)',
            color:'#ef4444',
            fontSize:12,
            fontWeight:600,
          }}>
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <label style={{ fontSize:12, fontWeight:600, color:'var(--text2)', display:'flex', flexDirection:'column', gap:6 }}>
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={e=>setEmail(e.target.value)}
              style={{
                height:40,
                borderRadius:10,
                border:'1.5px solid var(--glass-border)',
                padding:'0 11px',
                fontSize:13,
                fontFamily:'var(--font-body)',
                outline:'none',
                background:'rgba(255,255,255,0.92)',
              }}
            />
          </label>

          <label style={{ fontSize:12, fontWeight:600, color:'var(--text2)', display:'flex', flexDirection:'column', gap:6 }}>
            <span>Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={e=>setPassword(e.target.value)}
              style={{
                height:40,
                borderRadius:10,
                border:'1.5px solid var(--glass-border)',
                padding:'0 11px',
                fontSize:13,
                fontFamily:'var(--font-body)',
                outline:'none',
                background:'rgba(255,255,255,0.92)',
              }}
            />
          </label>

          <button
            type="submit"
            disabled={authLoading}
            style={{
              marginTop:6,
              height:42,
              borderRadius:999,
              border:'none',
              background: authLoading
                ? 'linear-gradient(90deg,#9ca3af,#d1d5db)'
                : 'linear-gradient(135deg,#1FD888,#22c55e)',
              color:'white',
              fontSize:14,
              fontWeight:800,
              cursor: authLoading ? 'default' : 'pointer',
              boxShadow:'0 8px 22px rgba(31,216,136,0.35)',
              fontFamily:'var(--font-body)',
              letterSpacing:'0.03em',
              textTransform:'uppercase',
            }}
          >
            {authLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop:18, fontSize:12, color:'var(--text3)', textAlign:'center' }}>
          New here?{' '}
          <Link to="/register" style={{ color:'var(--accent)', fontWeight:700 }}>
            Create an account
          </Link>
        </div>
      </div>
    </div>
  )
}

