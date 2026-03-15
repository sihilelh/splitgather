import React from 'react'
import { Card, CategoryIcon } from './UI.jsx'
import { CATEGORY_META } from '../constants/categories.js'

export default function ExpenseCard({ expense, friends, currentUserId = 'u1', onClick, showBalance = true, showCategoryBadge = false, showPeopleCount = false }) {
  const meta = CATEGORY_META[expense.category] || CATEGORY_META.other
  const youPaid = String(expense.paidBy) === String(currentUserId)
  const currentUserIdNum = typeof currentUserId === 'string' ? parseInt(currentUserId.replace(/[^0-9]/g, ''), 10) || currentUserId : currentUserId
  
  // Calculate user's share from splits if available, otherwise assume equal split
  let userShare = 0
  let isParticipant = false
  
  if (expense._record?.splits && Array.isArray(expense._record.splits)) {
    // Use actual split amounts from record
    const userSplit = expense._record.splits.find(s => String(s.userId) === String(currentUserId))
    if (userSplit) {
      userShare = parseFloat(userSplit.amount) || 0
      isParticipant = true
    }
  } else if (expense.splitWith && Array.isArray(expense.splitWith)) {
    // Fallback to equal split calculation
    const totalParticipants = expense.splitWith.length + 1 // +1 for payer
    userShare = expense.amount / totalParticipants
    isParticipant = youPaid || expense.splitWith.some(id => String(id) === String(currentUserId))
  } else {
    // No split info, assume user is not involved unless they paid
    userShare = youPaid ? expense.amount : 0
    isParticipant = youPaid
  }
  
  const per = userShare.toFixed(2)
  
  const getName = (id) => {
    if (String(id) === String(currentUserId)) return 'You'
    // Check payer details embedded in the record
    if (expense._record?.payer && String(expense._record.payer.id) === String(id)) {
      return expense._record.payer.name
    }
    // Check split user details embedded in the record
    const splitUser = expense._record?.splits?.find(s => String(s.userId) === String(id))?.user
    if (splitUser) return splitUser.name
    // Fall back to friends list
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
          {showBalance && isParticipant ? (() => {
            // Calculate balance from user's perspective
            // Positive = you're owed money (money coming to you)
            // Negative = you owe money (money going out)
            let balance = 0
            if (youPaid) {
              // You paid, so you're owed back: amount you paid - your share
              balance = expense.amount - parseFloat(per)
            } else {
              // You didn't pay, so you owe: your share (negative)
              balance = -parseFloat(per)
            }
            
            const isPositive = balance >= 0
            
            return (
              <>
                <div style={{
                  fontWeight: 800,
                  fontSize: showCategoryBadge ? 17 : 15,
                  color: isPositive ? 'var(--positive)' : 'var(--negative)',
                  letterSpacing: showCategoryBadge ? '-0.02em' : '0',
                }}>
                  {isPositive ? '+' : ''}LKR {Math.abs(balance).toFixed(2)}
                </div>
                <div style={{ fontSize: showCategoryBadge ? 13 : 11, color: 'var(--text3)' }}>
                  {isPositive ? 'owed' : 'owe'}
                </div>
              </>
            )
          })() : (
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
