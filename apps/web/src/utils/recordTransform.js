/**
 * Transform API record format to UI expense format
 * @param {Object} record - API record object
 * @param {number|string} currentUserId - Current user ID (number from API or string for UI)
 * @returns {Object} Expense object in UI format
 */
export function transformRecordToExpense(record, currentUserId) {
  if (!record) return null

  // Extract participant IDs from splits (excluding the payer)
  const splitWith = (record.splits || [])
    .map(split => split.userId)
    .filter(userId => userId !== record.paidBy)

  // Format date from ISO string to YYYY-MM-DD
  let date = ''
  if (record.expenseDate) {
    const d = new Date(record.expenseDate)
    date = d.toISOString().slice(0, 10)
  } else if (record.createdAt) {
    const d = new Date(record.createdAt)
    date = d.toISOString().slice(0, 10)
  }

  // Convert numeric IDs to strings for UI compatibility
  const paidByStr = String(record.paidBy)
  const splitWithStr = splitWith.map(id => String(id))

  return {
    id: String(record.id),
    title: record.description || '',
    amount: record.amount || 0,
    paidBy: paidByStr,
    splitWith: splitWithStr,
    date: date,
    category: record.category || 'other',
    groupId: record.groupId ? String(record.groupId) : null,
    // Keep original record for reference
    _record: record,
  }
}

/**
 * Transform UI expense format to API record format
 * @param {Object} expense - Expense object in UI format
 * @param {number|string} currentUserId - Current user ID
 * @returns {Object} Record object in API format
 */
export function transformExpenseToRecord(expense, currentUserId) {
  if (!expense) return null

  // Convert string IDs to numbers (handle both "u1" format and numeric strings)
  const paidByNum = typeof expense.paidBy === 'string' 
    ? (expense.paidBy.match(/\d+/) ? parseInt(expense.paidBy.match(/\d+/)[0], 10) : parseInt(expense.paidBy, 10))
    : expense.paidBy

  const participantIds = (expense.splitWith || [])
    .map(id => {
      if (typeof id === 'string') {
        const match = id.match(/\d+/)
        return match ? parseInt(match[0], 10) : parseInt(id, 10)
      }
      return id
    })
    .filter(id => id !== paidByNum && !isNaN(id))

  // Format date to ISO string
  let expenseDate = null
  if (expense.date) {
    expenseDate = new Date(expense.date).toISOString()
  }

  const record = {
    description: expense.title || expense.description || '',
    amount: parseFloat(expense.amount) || 0,
    paidBy: paidByNum,
    participantIds: participantIds,
    category: expense.category || null,
    expenseDate: expenseDate,
  }

  // Add groupId if present
  if (expense.groupId) {
    const groupIdNum = typeof expense.groupId === 'string'
      ? (expense.groupId.match(/\d+/) ? parseInt(expense.groupId.match(/\d+/)[0], 10) : parseInt(expense.groupId, 10))
      : expense.groupId
    if (!isNaN(groupIdNum)) {
      record.groupId = groupIdNum
    }
  }

  // Add split mode and data if present
  if (expense.splitMode) {
    record.splitMode = expense.splitMode
  }
  if (expense.splitData) {
    record.splitData = expense.splitData
  }

  return record
}

/**
 * Transform array of records to expenses
 * @param {Array} records - Array of API record objects
 * @param {number|string} currentUserId - Current user ID
 * @returns {Array} Array of expense objects in UI format
 */
export function transformRecordsToExpenses(records, currentUserId) {
  if (!Array.isArray(records)) return []
  return records.map(record => transformRecordToExpense(record, currentUserId))
}
