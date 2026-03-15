import React from 'react'
import { useTheme } from '../hooks/useTheme.jsx'

export default function StatsCard({ label, value, color, style = {} }) {
  const { theme } = useTheme()
  return (
    <div
      style={{
        background: theme === 'light' 
          ? 'rgba(255,255,255,0.52)'
          : 'rgba(16,16,20,0.60)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: theme === 'light'
          ? '1.5px solid rgba(255,255,255,0.80)'
          : '1.5px solid rgba(31,216,136,0.25)',
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
