import React from 'react'
import { Card, CategoryIcon } from './UI.jsx'
import { CATEGORY_META } from '../constants/categories.js'

export default function ExpenseCard({ expense, friends, currentUserId = 'u1', onClick, showBalance = true, showCategoryBadge = false, showPeopleCount = false }) {
  const meta = CATEGORY_META[expense.category] || CATEGORY_META.other
  const youPaid = String(expense.paidBy) === String(currentUserId)
  const per = expense.splitWith ? (expense.amount / (expense.splitWith.length + 1)).toFixed(2) : expense.amount.toFixed(2)
  
  const getName = (id) => {
    if (String(id) === String(currentUserId)) return 'You'
    return friends?.find(f => String(f.id) === String(id))?.name || '?'
  }

  const payer = getName(expense.paidBy)

  return (
    <Card onClick={onClick}>
      <div style={{ display: 'flex', alignItems: showCategoryBadge ? 'flex-start' : 'center', gap: 12 }}>
        <CategoryIcon meta={meta} size={showCategoryBadge ? 46 : 42} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: showCategoryBadge ? 800 : 700, fontSize: showCategoryBadge ? 15 : 14, color: 'var(--text)', marginBottom: showCategoryBadge ? 2 : 0 }}>
            {expense.description || expense.title}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: showCategoryBadge ? 0 : 0, marginBottom: showCategoryBadge ? 5 : 0 }}>
            {showPeopleCount 
              ? `${payer} paid · ${expense.splitWith ? expense.splitWith.length + 1 : 1} people`
              : `${payer} · ${expense.date}`
            }
          </div>
          {showCategoryBadge && (
            <span style={{
              fontSize: 11,
              background: `${meta.color}18`,
              color: meta.color,
              padding: '2px 9px',
              borderRadius: 999,
              fontWeight: 700,
              border: `1px solid ${meta.color}30`,
            }}>
              {meta.emoji} {meta.label}
            </span>
          )}
          {!showCategoryBadge && expense.splitWith && (
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
              {youPaid ? 'You paid' : expense.paidBy === currentUserId ? `${payer} paid` : 'Someone paid'} · ${expense.amount.toFixed(2)} total
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          {showBalance && (youPaid || (expense.splitWith && expense.splitWith.some(id => String(id) === String(currentUserId)))) ? (
            <>
              <div style={{
                fontWeight: 800,
                fontSize: showCategoryBadge ? 17 : 15,
                color: youPaid ? 'var(--positive)' : 'var(--negative)',
                letterSpacing: showCategoryBadge ? '-0.02em' : '0',
              }}>
                {youPaid ? `+LKR ${(expense.amount - parseFloat(per)).toFixed(2)}` : `-LKR ${per}`}
              </div>
              <div style={{ fontSize: showCategoryBadge ? 13 : 11, color: 'var(--text3)' }}>
                {youPaid ? 'lent' : 'owe'}
              </div>
            </>
          ) : (
            <>
              <div style={{
                fontWeight: 800,
                fontSize: showCategoryBadge ? 17 : 16,
                color: 'var(--text)',
                letterSpacing: showCategoryBadge ? '-0.02em' : '-0.02em',
              }}>
                LKR {expense.amount.toFixed(2)}
              </div>
              {showCategoryBadge && !youPaid && !(expense.splitWith && expense.splitWith.some(id => String(id) === String(currentUserId))) && (
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>not involved</div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
