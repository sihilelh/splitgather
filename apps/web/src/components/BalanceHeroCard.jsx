import React from 'react'
import { Button } from './UI.jsx'

export default function BalanceHeroCard({ title, balance, subtitle, breakdown, color = '#1FD888', onAction, actionLabel, style = {} }) {
  const isPositive = balance >= 0
  
  return (
    <div
      className="a2"
      style={{
        background: `linear-gradient(135deg, ${color}30 0%, ${color}22 50%, ${color}15 100%)`,
        backdropFilter: 'blur(24px) saturate(1.8)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
        border: '1.5px solid rgba(255,255,255,0.85)',
        borderRadius: 'var(--r-xl)',
        padding: '22px 22px 20px',
        boxShadow: `0 12px 40px ${color}15, 0 3px 10px rgba(0,0,0,0.06)`,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 120,
        height: 120,
        background: 'radial-gradient(circle,rgba(255,255,255,0.35) 0%,transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        bottom: -20,
        left: 20,
        width: 80,
        height: 80,
        background: `radial-gradient(circle,${color}25 0%,transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {title && (
        <div style={{
          fontSize: 11,
          color: 'var(--text3)',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          marginBottom: 5,
        }}>
          {title}
        </div>
      )}
      
      <div style={{
        fontSize: breakdown ? 34 : 46,
        fontWeight: 800,
        color: isPositive ? 'var(--accent)' : 'var(--negative)',
        letterSpacing: '-0.04em',
        lineHeight: 1,
        marginBottom: 14,
      }}>
        {isPositive ? '+' : ''}{Math.abs(balance).toFixed(2)}
        <span style={{ fontSize: breakdown ? 18 : 20 }}> LKR</span>
      </div>

      {subtitle && (
        <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 14 }}>
          {subtitle}
        </div>
      )}

      {breakdown && (
        <div style={{ display: 'flex', gap: 20 }}>
          {breakdown.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <div style={{ width: 1, background: 'rgba(112,112,112,0.15)' }} />}
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, marginBottom: 1 }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: item.positive ? 'var(--positive)' : 'var(--negative)',
                }}>
                  {item.positive ? '+' : '-'}LKR {Math.abs(item.value).toFixed(2)}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      )}

      {onAction && actionLabel && (
        <div style={{ marginTop: 14 }}>
          <Button
            onClick={onAction}
            variant={isPositive ? 'primary' : 'danger'}
            style={{ width: 'auto', padding: '10px 18px' }}
            size="sm"
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
