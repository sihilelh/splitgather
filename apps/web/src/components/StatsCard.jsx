import React from 'react'

export default function StatsCard({ label, value, color, style = {} }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.52)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(255,255,255,0.80)',
        borderRadius: 'var(--r-md)',
        padding: '15px 10px',
        textAlign: 'center',
        boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
        ...style,
      }}
    >
      <div style={{
        fontSize: 22,
        fontWeight: 800,
        color: color,
        letterSpacing: '-0.03em',
        lineHeight: 1.1,
        marginBottom: 4,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>
        {label}
      </div>
    </div>
  )
}
