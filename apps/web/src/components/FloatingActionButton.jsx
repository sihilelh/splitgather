import React from 'react'

export default function FloatingActionButton({ onClick, icon = '＋', style = {} }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 24,
        width: 58,
        height: 58,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#1FD888,#4BE5A0)',
        border: '2px solid rgba(31,216,136,0.70)',
        color: '#0a0a0a',
        fontSize: 28,
        cursor: 'pointer',
        boxShadow: '0 8px 28px rgba(31,216,136,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 150,
        transition: 'transform .15s, box-shadow .2s',
        fontFamily: 'var(--font-body)',
        animation: 'float 4s ease-in-out infinite',
        ...style,
      }}
      onMouseDown={e => {
        e.currentTarget.style.transform = 'scale(0.90)'
        e.currentTarget.style.animation = 'none'
      }}
      onMouseUp={e => {
        e.currentTarget.style.transform = 'scale(1)'
        e.currentTarget.style.animation = 'float 4s ease-in-out infinite'
      }}
    >
      {icon}
    </button>
  )
}
