import React from 'react'

export default function ScreenHeader({ title, action, style = {} }) {
  return (
    <div className="a1" style={{ padding: '52px 20px 16px', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em' }}>
          {title}
        </h1>
        {action}
      </div>
    </div>
  )
}
