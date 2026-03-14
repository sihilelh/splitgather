import React from 'react'

const DEFAULT_METHODS = [
  { id: 'cash', label: '💵 Cash' },
  { id: 'bank', label: '🏦 Bank Transfer' },
  { id: 'mobile', label: '📱 Mobile Payment' },
  { id: 'other', label: '🔗 Other' },
]

export default function PaymentMethodSelector({ selected, onSelect, methods = DEFAULT_METHODS }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block',
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--text3)',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: 8,
      }}>
        Payment Method
      </label>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {methods.map(method => (
          <button
            key={method.id}
            onClick={() => onSelect(method.id)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--r-md)',
              border: `1.5px solid ${selected === method.id ? '#1FD888' : 'rgba(255,255,255,0.75)'}`,
              background: selected === method.id
                ? 'linear-gradient(135deg, rgba(31,216,136,0.15), rgba(31,216,136,0.10))'
                : 'rgba(255,255,255,0.50)',
              color: selected === method.id ? 'var(--accent)' : 'var(--text2)',
              fontSize: 12,
              fontWeight: selected === method.id ? 700 : 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              transition: 'all .18s',
            }}
          >
            {method.label}
          </button>
        ))}
      </div>
    </div>
  )
}
