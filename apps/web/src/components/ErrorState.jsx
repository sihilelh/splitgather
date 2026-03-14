import React from 'react'

export default function ErrorState({ emoji = '⚠️', message, style = {} }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 90,
      ...style,
    }}>
      <div style={{ textAlign: 'center', color: 'var(--negative)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>{emoji}</div>
        <div>{message}</div>
      </div>
    </div>
  )
}
