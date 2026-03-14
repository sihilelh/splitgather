import React from 'react'

export default function SearchInput({ value, onChange, placeholder, style = {} }) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%',
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(255,255,255,0.82)',
        borderRadius: 'var(--r-md)',
        color: 'var(--text)',
        padding: '11px 14px',
        fontSize: 14,
        outline: 'none',
        marginBottom: 14,
        fontFamily: 'var(--font-body)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        transition: 'border-color .2s, box-shadow .2s',
        ...style,
      }}
      onFocus={e => {
        e.target.style.borderColor = '#1FD888'
        e.target.style.boxShadow = '0 0 0 3px rgba(31,216,136,.25)'
      }}
      onBlur={e => {
        e.target.style.borderColor = 'rgba(255,255,255,0.82)'
        e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'
      }}
    />
  )
}
