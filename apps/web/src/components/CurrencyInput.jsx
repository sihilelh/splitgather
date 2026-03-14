import React, { useState } from 'react'

export default function CurrencyInput({ value, onChange, placeholder = '0.00', label, onFocus, onBlur, style = {} }) {
  const [focused, setFocused] = useState(false)

  const handleFocus = (e) => {
    setFocused(true)
    if (onFocus) onFocus(e)
    e.target.style.borderColor = '#1FD888'
    e.target.style.boxShadow = '0 0 0 3px rgba(31,216,136,.25)'
  }

  const handleBlur = (e) => {
    setFocused(false)
    if (onBlur) onBlur(e)
    e.target.style.borderColor = 'rgba(255,255,255,0.80)'
    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
  }

  return (
    <div style={{ marginBottom: label ? 16 : 0, ...style }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text3)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: 6,
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <span style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: focused || value ? 'var(--accent)' : 'var(--text3)',
          fontSize: label ? 20 : 16,
          fontWeight: 800,
          transition: 'color .2s',
        }}>
          LKR
        </span>
        <input
          type="number"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.60)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(255,255,255,0.80)',
            borderRadius: 'var(--r-md)',
            color: 'var(--text)',
            padding: label ? '13px 14px 13px 50px' : '13px 14px 13px 34px',
            fontSize: label ? 26 : 20,
            fontWeight: 800,
            outline: 'none',
            fontFamily: 'var(--font-body)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'border-color .2s, box-shadow .2s',
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      </div>
    </div>
  )
}
