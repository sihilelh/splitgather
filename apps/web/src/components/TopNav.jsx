import React from 'react'
import { Link } from 'react-router-dom'

const TABS = [
  { path:'/',         label:'Home',     Icon:HomeIcon },
  { path:'/groups',   label:'Groups',   Icon:GroupsIcon },
  { path:'/friends',  label:'Friends',  Icon:FriendsIcon },
  { path:'/activity', label:'Activity', Icon:ActivityIcon },
  { path:'/account',  label:'Account',  Icon:AccountIcon },
]

export default function TopNav({ currentPath }) {
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
        UniSplit
      </div>

      {/* Navigation Items */}
      <div style={{
        display:'flex',
        gap:8,
        alignItems:'center',
      }}>
        {TABS.map(({path,label,Icon})=>{
          const isActive = currentPath === path
          return (
            <Link key={path} to={path} style={{textDecoration:'none'}}>
              <button style={{
                display:'flex',
                alignItems:'center',
                gap:6,
                padding:'8px 14px',
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
              }}
              onMouseDown={e=>e.currentTarget.style.transform='scale(0.95)'}
              onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
              >
                <Icon size={16} active={isActive}/>
                <span>{label}</span>
              </button>
            </Link>
          )
        })}
      </div>

      {/* Spacer for alignment */}
      <div style={{ width:60 }}/>
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
