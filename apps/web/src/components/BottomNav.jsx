import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

const TABS = [
  { path:'/',         label:'Home',     Icon:HomeIcon },
  { path:'/groups',   label:'Groups',   Icon:GroupsIcon },
  { path:'/friends',  label:'Friends',  Icon:FriendsIcon },
  { path:'/activity', label:'Activity', Icon:ActivityIcon },
  { path:'/account',  label:'Account',  Icon:AccountIcon },
]

export default function BottomNav({ currentPath }) {
  const { user } = useAuth()

  return (
    <nav style={{
      position:'fixed', bottom:0,
      left:'50%', transform:'translateX(-50%)',
      width:'100%', maxWidth:430,
      background:'var(--nav-bg)',
      backdropFilter:'blur(28px) saturate(2)',
      WebkitBackdropFilter:'blur(28px) saturate(2)',
      borderTop:'1.5px solid var(--glass-border)',
      boxShadow:'var(--glass-shadow)',
      display:'flex',
      paddingBottom:'env(safe-area-inset-bottom, 4px)',
      zIndex:200,
      transition:'background .3s, box-shadow .3s',
    }}>
      {TABS.map(({path,label,Icon})=>{
        if (!user && path !== '/') {
          // When logged out, bottom nav is hidden by ProtectedRoute for main routes anyway;
          // keep the buttons but they will redirect to login immediately.
        }
        const isActive = currentPath === path
        return (
          <Link key={path} to={path} style={{flex:1, textDecoration:'none'}}>
            <button style={{
              flex:1, display:'flex', flexDirection:'column',
              alignItems:'center', gap:2,
              padding:'9px 0 6px',
              background:'none', border:'none',
              color: isActive?'#1FD888':'var(--text3)',
              fontSize:9, fontWeight:isActive?800:500,
              cursor:'pointer',
              transition:'color .2s, transform .12s',
              textTransform:'uppercase', letterSpacing:'0.4px',
              fontFamily:'var(--font-body)',
              position:'relative',
              width:'100%',
            }}
            onMouseDown={e=>e.currentTarget.style.transform='scale(0.88)'}
            onMouseUp={e=>e.currentTarget.style.transform='scale(1)'}
            onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
            >
              <div style={{
                position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
                width:28, height:3,
                background: isActive 
                  ? 'linear-gradient(90deg,#1FD888,#4BE5A0)' 
                  : 'transparent',
                borderRadius:'0 0 4px 4px',
                boxShadow: isActive
                  ? '0 2px 8px rgba(31,216,136,0.55)'
                  : 'none',
                transition:'background .2s, box-shadow .2s',
              }}/>
              <div style={{
                width:34, height:34, borderRadius:11,
                display:'flex', alignItems:'center', justifyContent:'center',
                background: isActive
                  ? 'linear-gradient(135deg,rgba(31,216,136,0.25),rgba(31,216,136,0.15))'
                  : 'transparent',
                border: isActive?'1px solid rgba(31,216,136,0.30)':'1px solid transparent',
                boxShadow: isActive?'0 3px 10px rgba(31,216,136,0.20)':'none',
                transition:'all .2s',
              }}>
                <Icon size={19} active={isActive}/>
              </div>
              {label}
            </button>
          </Link>
        )
      })}
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
