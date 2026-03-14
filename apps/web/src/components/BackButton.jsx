import React from 'react'

export default function BackButton({ onClick, label = '← Back', style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        color: 'var(--accent)',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        padding: '0 0 12px',
        fontFamily: 'var(--font-body)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        ...style,
      }}
    >
      {label}
    </button>
  )
}
