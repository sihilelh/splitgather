import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useTheme } from '../hooks/useTheme.jsx'

const TABS = [
  { path:'/',         label:'Home',     Icon:HomeIcon },
  { path:'/groups',   label:'Groups',   Icon:GroupsIcon },
  { path:'/friends',  label:'Friends',  Icon:FriendsIcon },
  { path:'/activity', label:'Activity', Icon:ActivityIcon },
  { path:'/account',  label:'Account',  Icon:AccountIcon },
]

export default function TopNav({ currentPath }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setShowMenu(false)
  }

  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0,
      height:72,
      background:'var(--nav-bg)',
      backdropFilter:'blur(32px) saturate(2.2)',
      WebkitBackdropFilter:'blur(32px) saturate(2.2)',
      borderBottom:'1.5px solid var(--glass-border)',
      boxShadow:'var(--glass-shadow)',
      display:'flex',
      alignItems:'center',
      justifyContent:'space-between',
      paddingLeft:24,
      paddingRight:24,
      zIndex:200,
      transition:'background .3s, box-shadow .3s, border-color .3s',
    }}>
      {/* Brand/Logo */}
      <div style={{
        fontSize:20,
        fontWeight:900,
        color:'var(--accent)',
        letterSpacing:'-0.02em',
        fontFamily:'var(--font-body)',
      }}>
        SplitGather
      </div>

      {/* Right side: User menu and dropdown */}
      <div style={{ display:'flex', gap:12, alignItems:'center', position:'relative' }}>
        {/* Quick nav for desktop */}
        <div style={{
          display:'flex',
          gap:4,
          alignItems:'center',
        }}>
          {TABS.slice(0, 3).map(({path,label,Icon})=>{
            const isActive = currentPath === path
            return (
              <Link key={path} to={path} style={{textDecoration:'none'}}>
                <button style={{
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  width:40,
                  height:40,
                  padding:0,
                  background: isActive
                    ? 'linear-gradient(135deg,rgba(31,216,136,0.20),rgba(31,216,136,0.10))'
                    : 'transparent',
                  border: isActive?'1.5px solid rgba(31,216,136,0.30)':'1.5px solid transparent',
                  borderRadius:'var(--r-md)',
                  color: isActive?'var(--accent)':'var(--text2)',
                  fontSize:13,
                  fontWeight: isActive?700:600,
                  cursor:'pointer',
                  transition:'all .2s',
                  fontFamily:'var(--font-body)',
                  letterSpacing:'-0.01em',
                  boxShadow: isActive?'0 2px 8px rgba(31,216,136,0.15)':'none',
                  title: label,
                }}
                onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'}
                onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
                >
                  <Icon size={18} active={isActive}/>
                </button>
              </Link>
            )
          })}
        </div>

        {/* User menu dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              padding:'8px 12px',
              borderRadius:999,
              background: theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(28,28,36,0.80)',
              border:'1.5px solid ' + (theme === 'light' ? 'rgba(255,255,255,0.80)' : 'rgba(31,216,136,0.25)'),
              fontSize:12,
              fontWeight:600,
              color:'var(--text)',
              cursor:'pointer',
              fontFamily:'var(--font-body)',
              display:'flex',
              alignItems:'center',
              gap:6,
              transition:'all .2s',
            }}
            onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'}
            onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
          >
            <span>👤 {user?.name?.split(' ')[0] || 'Menu'}</span>
            <span style={{
              fontSize:10,
              transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)',
              transition:'transform .2s',
            }}>
              ▼
            </span>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div style={{
              position:'absolute',
              top:'100%',
              right:0,
              marginTop:8,
              background:'var(--card-bg)',
              borderRadius:'var(--r-lg)',
              border:'1.5px solid var(--glass-border)',
              boxShadow:'0 8px 32px rgba(0,0,0,0.15)',
              backdropFilter:'blur(12px)',
              WebkitBackdropFilter:'blur(12px)',
              minWidth:200,
              zIndex:300,
              overflow:'hidden',
            }}>
              {/* All nav items */}
              {TABS.map(({path, label, Icon}) => {
                const isActive = currentPath === path
                return (
                  <Link key={path} to={path} style={{textDecoration:'none'}}>
                    <button
                      onClick={() => setShowMenu(false)}
                      style={{
                        width:'100%',
                        padding:'12px 16px',
                        display:'flex',
                        alignItems:'center',
                        gap:10,
                        background: isActive ? 'rgba(31,216,136,0.12)' : 'transparent',
                        border:'none',
                        borderLeft:`3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                        color: isActive?'var(--accent)':'var(--text)',
                        fontSize:13,
                        fontWeight: isActive?700:600,
                        cursor:'pointer',
                        fontFamily:'var(--font-body)',
                        transition:'all .2s',
                      }}
                    >
                      <Icon size={16} active={isActive}/>
                      <span>{label}</span>
                    </button>
                  </Link>
                )
              })}
              
              <div style={{
                height:'1px',
                background:'rgba(255,255,255,0.10)',
                margin:'6px 0',
              }}/>
              <button
                onClick={() => {
                  toggleTheme()
                  setShowMenu(false)
                }}
                style={{
                  width:'100%',
                  padding:'12px 16px',
                  display:'flex',
                  alignItems:'center',
                  gap:10,
                  background:'transparent',
                  border:'none',
                  color:'var(--text)',
                  fontSize:13,
                  fontWeight:600,
                  cursor:'pointer',
                  fontFamily:'var(--font-body)',
                  transition:'all .2s',
                }}
              >
                <span style={{fontSize:16}}>{theme === 'light' ? '🌙' : '☀️'}</span>
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>

              <div style={{
                height:'1px',
                background:'rgba(255,255,255,0.10)',
                margin:'6px 0',
              }}/>

              {/* 
              {/* Logout button */}
              <button
                onClick={handleLogout}
                style={{
                  width:'100%',
                  padding:'12px 16px',
                  display:'flex',
                  alignItems:'center',
                  gap:10,
                  background:'transparent',
                  border:'none',
                  color:'#ef4444',
                  fontSize:13,
                  fontWeight:600,
                  cursor:'pointer',
                  fontFamily:'var(--font-body)',
                  transition:'all .2s',
                }}
              >
                <span style={{fontSize:16}}>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}


function HomeIcon({size,active}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.3:1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
}
function GroupsIcon({size,active}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.3:1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
}
function FriendsIcon({size,active}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.3:1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
}
function ActivityIcon({size,active}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.3:1.8} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
}
function AccountIcon({size,active}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active?2.3:1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
}
