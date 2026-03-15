import React from 'react'

/* ── Floating background orbs ─────────────────────────────────────── */
export function BgOrbs() {
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-80, left:-60, width:280, height:280,
        borderRadius:'50%', background:'radial-gradient(circle, rgba(31,216,136,0.15) 0%, transparent 70%)',
        animation:'orbDrift 9s ease-in-out infinite' }} />
      <div style={{ position:'absolute', top:120, right:-80, width:220, height:220,
        borderRadius:'50%', background:'radial-gradient(circle, rgba(31,216,136,0.12) 0%, transparent 70%)',
        animation:'orbDrift 12s ease-in-out infinite reverse' }} />
      <div style={{ position:'absolute', bottom:100, left:40, width:180, height:180,
        borderRadius:'50%', background:'radial-gradient(circle, rgba(31,216,136,0.10) 0%, transparent 70%)',
        animation:'orbDrift 15s ease-in-out infinite 2s' }} />
      <div style={{ position:'absolute', bottom:-60, right:20, width:240, height:240,
        borderRadius:'50%', background:'radial-gradient(circle, rgba(31,216,136,0.08) 0%, transparent 70%)',
        animation:'orbDrift 11s ease-in-out infinite 1s reverse' }} />
    </div>
  )
}

/* ── Glass card ───────────────────────────────────────────────────── */
export function Card({ children, style={}, onClick, className='' }) {
  const [hov, setHov] = React.useState(false)
  return (
    <div
      className={className}
      onClick={onClick}
      onMouseEnter={() => onClick && setHov(true)}
      onMouseLeave={() => setHov(false)}
      onMouseDown={e => { if(onClick) e.currentTarget.style.transform='scale(0.985)' }}
      onMouseUp={e => { if(onClick) e.currentTarget.style.transform='scale(1)' }}
      style={{
        background: hov ? 'var(--glass-bg-deep)' : 'var(--glass-bg)',
        backdropFilter: 'blur(28px) saturate(2.0)',
        WebkitBackdropFilter: 'blur(28px) saturate(2.0)',
        border: '1.5px solid var(--glass-border)',
        boxShadow: hov ? 'var(--glass-shadow-lg)' : 'var(--glass-shadow)',
        borderRadius: 'var(--r-lg)',
        padding: '14px 16px',
        marginBottom: 10,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background .2s, box-shadow .2s, transform .12s, border-color .3s',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/* ── Avatar ───────────────────────────────────────────────────────── */
export function Avatar({ initials, color='#1FD888', size=40, style={} }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background:`linear-gradient(135deg, ${color}33, ${color}18)`,
      border:`2px solid ${color}55`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.32, fontWeight:800, color,
      flexShrink:0,
      boxShadow:`0 3px 10px ${color}30`,
      ...style,
    }}>
      {initials}
    </div>
  )
}

/* ── Balance Badge ────────────────────────────────────────────────── */
export function BalanceBadge({ value, small=false }) {
  if(value===0) return (
    <span style={{ fontSize:small?11:12, fontWeight:700,
      color:'var(--text3)', background:'rgba(120,160,60,0.12)',
      border:'1px solid rgba(120,160,60,0.20)',
      padding:'3px 10px', borderRadius:999 }}>settled ✓</span>
  )
  const pos = value > 0
  return (
    <span style={{ fontSize:small?11:12, fontWeight:700,
      color: pos?'var(--positive)':'var(--negative)',
      background: pos?'var(--positive-bg)':'var(--negative-bg)',
      border:`1px solid ${pos?'rgba(31,216,136,0.25)':'rgba(210,50,20,0.20)'}`,
      padding:'3px 10px', borderRadius:999 }}>
      {pos ? `+LKR ${value.toFixed(2)}` : `-LKR ${Math.abs(value).toFixed(2)}`}
    </span>
  )
}

/* ── Button ───────────────────────────────────────────────────────── */
export function Button({ children, variant='primary', onClick, disabled, style={}, size='md' }) {
  const pad = { sm:'9px 18px', md:'13px 22px', lg:'15px 26px' }[size]
  const fs  = { sm:13, md:15, lg:16 }[size]
  const variants = {
    primary: {
      background:'linear-gradient(135deg, #1FD888 0%, #4BE5A0 100%)',
      color:'#0a0a0a',
      boxShadow:'0 6px 22px rgba(31,216,136,0.35), 0 2px 6px rgba(0,0,0,0.08)',
      border:'1.5px solid rgba(31,216,136,0.40)',
    },
    secondary: {
      background:'var(--glass-bg)',
      backdropFilter:'blur(12px)',
      WebkitBackdropFilter:'blur(12px)',
      color:'var(--text)',
      border:'1.5px solid var(--glass-border)',
      boxShadow:'var(--glass-shadow)',
    },
    danger: {
      background:'var(--negative-bg)',
      color:'var(--negative)',
      border:'1.5px solid rgba(239,68,68,0.30)',
      boxShadow:'none',
    },
    ghost: {
      background:'rgba(31,216,136,0.12)',
      color:'var(--accent)',
      border:'1.5px solid rgba(31,216,136,0.35)',
      boxShadow:'none',
    },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width:'100%', padding:pad, fontSize:fs,
        borderRadius:'var(--r-md)',
        fontFamily:'var(--font-body)', fontWeight:800,
        cursor:disabled?'not-allowed':'pointer',
        opacity:disabled?0.45:1,
        display:'inline-flex', alignItems:'center', justifyContent:'center', gap:6,
        transition:'transform .12s, box-shadow .2s, opacity .2s, background .3s',
        letterSpacing:'-0.01em',
        ...variants[variant],
        ...style,
      }}
      onMouseDown={e => { if(!disabled) e.currentTarget.style.transform='scale(0.96)' }}
      onMouseUp={e => { e.currentTarget.style.transform='scale(1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform='scale(1)' }}
    >
      {children}
    </button>
  )
}

/* ── Input ────────────────────────────────────────────────────────── */
export function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom:12 }}>
      {label && <label style={{ display:'block', fontSize:11, fontWeight:700,
        color:'var(--text3)', textTransform:'uppercase', letterSpacing:'1px', marginBottom:6 }}>{label}</label>}
      <input style={{
        width:'100%',
        background:'var(--glass-bg)',
        backdropFilter:'blur(12px)',
        WebkitBackdropFilter:'blur(12px)',
        border:'1.5px solid var(--glass-border)',
        borderRadius:'var(--r-md)',
        color:'var(--text)',
        padding:'12px 14px',
        fontSize:15,
        fontFamily:'var(--font-body)',
        boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
        transition:'border-color .2s, box-shadow .2s, background .3s',
      }} {...props} />
    </div>
  )
}

/* ── Section Label ────────────────────────────────────────────────── */
export function SectionLabel({ children, action }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', margin:'18px 0 9px' }}>
      <span style={{ fontSize:11, fontWeight:700, color:'var(--text3)',
        letterSpacing:'1.4px', textTransform:'uppercase' }}>{children}</span>
      {action}
    </div>
  )
}

/* ── Bottom Sheet ─────────────────────────────────────────────────── */
export function BottomSheet({ open, onClose, children, title }) {
  if(!open) return null
  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(15,15,15,0.40)',
        backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)',
        zIndex:300, display:'flex', alignItems:'flex-end',
        animation:'fadeIn .2s ease' }}
      onClick={onClose}
    >
      <div
        onClick={e=>e.stopPropagation()}
        style={{
          background:'var(--glass-bg-deep)',
          backdropFilter:'blur(36px) saturate(2.1)',
          WebkitBackdropFilter:'blur(36px) saturate(2.1)',
          borderRadius:'28px 28px 0 0',
          border:'1.5px solid var(--glass-border)',
          borderBottom:'none',
          boxShadow:'var(--glass-shadow-lg)',
          padding:'20px 20px 44px',
          width:'100%',
          maxHeight:'92vh',
          overflowY:'auto',
          animation:'slideUp .32s cubic-bezier(.32,.72,0,1)',
          transition:'background .3s, box-shadow .3s, border-color .3s',
        }}
      >
        {title && <h2 style={{ fontSize:21, fontWeight:800, marginBottom:20,
          color:'var(--text)', letterSpacing:'-0.02em' }}>{title}</h2>}
        {children}
      </div>
    </div>
  )
}

/* ── Empty State ──────────────────────────────────────────────────── */
export function EmptyState({ emoji, title, subtitle }) {
  return (
    <div style={{ textAlign:'center', padding:'52px 24px', color:'var(--text3)' }}>
      <div style={{ fontSize:52, marginBottom:12,
        animation:'float 3s ease-in-out infinite' }}>{emoji}</div>
      <div style={{ fontSize:16, fontWeight:700, color:'var(--text2)', marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:14, color:'var(--text3)' }}>{subtitle}</div>
    </div>
  )
}

/* ── Category Icon ────────────────────────────────────────────────── */
export function CategoryIcon({ meta, size=44 }) {
  return (
    <div style={{
      width:size, height:size,
      borderRadius:size*0.28,
      background:`linear-gradient(135deg, ${meta.color}22, ${meta.color}10)`,
      border:`1.5px solid ${meta.color}35`,
      boxShadow:`0 3px 10px ${meta.color}20`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.46, flexShrink:0,
    }}>
      {meta.emoji}
    </div>
  )
}

/* ── Toast ────────────────────────────────────────────────────────── */
export function Toast({ message }) {
  if(!message) return null
  return (
    <div style={{
      position:'fixed', bottom:20, left:'50%',
      transform:'translateX(-50%)',
      background:'linear-gradient(135deg, rgba(31,216,136,0.25), rgba(75,229,160,0.15))',
      backdropFilter:'blur(24px) saturate(2.0)',
      WebkitBackdropFilter:'blur(24px) saturate(2.0)',
      color:'#0a0a0a',
      padding:'11px 22px', borderRadius:999,
      fontSize:13, fontWeight:800,
      whiteSpace:'nowrap',
      boxShadow:'0 12px 36px rgba(31,216,136,0.30), 0 4px 12px rgba(0,0,0,0.20)',
      zIndex:400,
      animation:'toastIn .3s cubic-bezier(.22,1,.36,1)',
      pointerEvents:'none',
      border:'1.5px solid rgba(31,216,136,0.60)',
    }}>
      ✓ {message}
    </div>
  )
}

/* ── Pill ─────────────────────────────────────────────────────────── */
export function Pill({ children, active, color='#1FD888', onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink:0,
        padding:'7px 14px', borderRadius:999,
        border:`1.5px solid ${active ? color : 'rgba(31,216,136,0.20)'}`,
        background: active
          ? `linear-gradient(135deg, ${color}25, ${color}15)`
          : 'rgba(255,255,255,0.35)',
        backdropFilter:'blur(8px)',
        WebkitBackdropFilter:'blur(8px)',
        color: active ? color : 'var(--text2)',
        fontSize:13, fontWeight:700,
        cursor:'pointer',
        fontFamily:'var(--font-body)',
        transition:'all .15s',
        boxShadow: active ? `0 3px 12px ${color}25` : '0 2px 6px rgba(0,0,0,0.04)',
      }}
    >{children}</button>
  )
}

/* ── Theme Toggle ─────────────────────────────────────────────────── */
export function ThemeToggle({ onClick, currentTheme }) {
  return (
    <button
      onClick={onClick}
      style={{
        position:'fixed', top:16, right:16, zIndex:250,
        width:48, height:48,
        borderRadius:'50%',
        background:'var(--glass-bg)',
        backdropFilter:'blur(20px) saturate(1.7)',
        WebkitBackdropFilter:'blur(20px) saturate(1.7)',
        border:'1.5px solid var(--glass-border)',
        boxShadow:'var(--glass-shadow)',
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:24, cursor:'pointer',
        transition:'transform .15s, box-shadow .2s, background .3s',
        color:'var(--text)',
        fontWeight:600,
      }}
      onMouseDown={e => e.currentTarget.style.transform='scale(0.90)'}
      onMouseUp={e => e.currentTarget.style.transform='scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}
      title={currentTheme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {currentTheme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}

