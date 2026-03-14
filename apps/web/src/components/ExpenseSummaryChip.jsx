import React from 'react'

export default function ExpenseSummaryChip({ title, peopleCount, amount, style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '13px 16px',
        marginBottom: 16,
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1.5px solid rgba(255,255,255,0.80)',
        borderRadius: 'var(--r-md)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        ...style,
      }}
    >
      <span style={{ color: 'var(--text2)', fontSize: 14, fontWeight: 600 }}>
        {title || `${peopleCount} people`}
      </span>
      <span style={{
        fontSize: 22,
        fontWeight: 800,
        color: 'var(--text)',
        letterSpacing: '-0.02em',
      }}>
        LKR {parseFloat(amount).toFixed(2)}
      </span>
    </div>
  )
}
