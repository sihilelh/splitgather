import recordDAO from '../dao/recordDAO.js';
import recordSplitDAO from '../dao/recordSplitDAO.js';
import recordHistoryDAO from '../dao/recordHistoryDAO.js';
import friendDAO from '../dao/friendDAO.js';
import userDAO from '../dao/userDAO.js';

/**
 * Calculate splits based on split mode
 * @param {number} amount - Total expense amount
 * @param {Array<number>} participantIds - Array of user IDs (excluding payer)
 * @param {number} payerId - User ID who paid
 * @param {string} splitMode - 'equal', 'percentage', or 'custom'
 * @param {Object} splitData - Split data (percentages or custom amounts)
 * @returns {Object} Object with splits { userId: amount }
 */
function calculateSplits(amount, participantIds, payerId, splitMode, splitData = {}) {
  const splits = {};
  const allParticipants = [payerId, ...participantIds];
  let total = 0;

  if (splitMode === 'equal') {
    const perPerson = amount / allParticipants.length;
    allParticipants.forEach(userId => {
      splits[userId] = perPerson;
      total += perPerson;
    });
  } else if (splitMode === 'percentage') {
    allParticipants.forEach(userId => {
      const percentage = splitData[userId] || 0;
      const splitAmount = (amount * percentage) / 100;
      splits[userId] = splitAmount;
      total += splitAmount;
    });
  } else if (splitMode === 'custom') {
    allParticipants.forEach(userId => {
      const splitAmount = parseFloat(splitData[userId] || 0);
      splits[userId] = splitAmount;
      total += splitAmount;
    });
  }

  // Handle rounding: distribute any difference to the payer
  const difference = amount - total;
  if (Math.abs(difference) > 0.01) {
    splits[payerId] = (splits[payerId] || 0) + difference;
  }

  return splits;
}

/**
 * Update friend balances for a record
 * @param {number} recordId - Record ID
 * @param {boolean} reverse - If true, reverse the balances (for updates/deletes)
 * @returns {Promise<void>}
 */
async function updateFriendBalancesForRecord(recordId, reverse = false) {
  const record = await recordDAO.findById(recordId);
  if (!record) return;

  const splits = await recordSplitDAO.getSplitsByRecordId(recordId);
  const payerId = record.paidBy;

  // Update balances for each participant
  for (const split of splits) {
    const participantId = split.userId;
    
    // Skip if participant is the payer (they don't owe themselves)
    if (participantId === payerId) continue;

    // Calculate the amount: participant owes payer
    const amount = reverse ? -split.amount : split.amount;

    // Ensure friendship exists
    let friendRecord = await friendDAO.findByUsers(payerId, participantId);
    if (!friendRecord) {
      // Create friendship if it doesn't exist
      friendRecord = await friendDAO.create(payerId, participantId);
    }

    // Update balance: if payer is userA, increase userAowsB (payer is owed)
    // If payer is userB, decrease userAowsB (payer is owed)
    await friendDAO.updateBalance(payerId, participantId, amount);
  }
}

/**
 * Create a new expense record
 * @param {number} userId - User ID creating the record
 * @param {Object} recordData - Record data
 * @param {string} recordData.description - Expense description
 * @param {number} recordData.amount - Expense amount
 * @param {number} [recordData.groupId] - Optional group ID
 * @param {number} recordData.paidBy - User ID who paid
 * @param {Array<number>} recordData.participantIds - Array of user IDs involved (excluding payer)
 * @param {string} recordData.splitMode - 'equal', 'percentage', or 'custom'
 * @param {Object} recordData.splitData - Split data (percentages or custom amounts)
 * @param {string} [recordData.category] - Optional category
 * @param {Date} [recordData.expenseDate] - Optional expense date
 * @returns {Promise<Object>} Created record with splits
 */
export async function createRecord(userId, recordData) {
  const {
    description,
    amount,
    groupId,
    paidBy,
    participantIds = [],
    splitMode = 'equal',
    splitData = {},
    category,
    expenseDate,
  } = recordData;

  // Validate payer exists
  const payer = await userDAO.findById(paidBy);
  if (!payer) {
    const error = new Error('Payer not found');
    error.statusCode = 404;
    throw error;
  }

  // Validate participants exist
  for (const participantId of participantIds) {
    const participant = await userDAO.findById(participantId);
    if (!participant) {
      const error = new Error(`Participant ${participantId} not found`);
      error.statusCode = 404;
      throw error;
    }
  }

  // Calculate splits
  const splits = calculateSplits(amount, participantIds, paidBy, splitMode, splitData);

  // Validate split totals
  const splitTotal = Object.values(splits).reduce((sum, amt) => sum + amt, 0);
  if (Math.abs(splitTotal - amount) > 0.01) {
    const error = new Error('Split amounts do not match expense amount');
    error.statusCode = 400;
    throw error;
  }

  // Create record
  const record = await recordDAO.create({
    groupId: groupId || null,
    paidBy,
    description,
    amount,
    category: category || null,
    expenseDate: expenseDate ? new Date(expenseDate) : null,
  });

  // Create splits - include all participants (payer included if they're part of the split)
  const splitRecords = [];
  for (const [userId, splitAmount] of Object.entries(splits)) {
    const userIdNum = parseInt(userId);
    // Create split for all participants, including payer if they're in participantIds
    // If payer is not in participantIds, they're paying for others only
    if (userIdNum === paidBy && participantIds.includes(userIdNum)) {
      // Payer is part of the split
      const split = await recordSplitDAO.create({
        recordId: record.id,
        userId: userIdNum,
        amount: splitAmount,
      });
      splitRecords.push(split);
    } else if (userIdNum !== paidBy) {
      // Participant (not payer)
      const split = await recordSplitDAO.create({
        recordId: record.id,
        userId: userIdNum,
        amount: splitAmount,
      });
      splitRecords.push(split);
    }
  }

  // Update friend balances
  await updateFriendBalancesForRecord(record.id, false);

  // Create history entry
  await recordHistoryDAO.create({
    recordId: record.id,
    action: 'created',
    changedBy: userId,
    newData: {
      record,
      splits: splitRecords,
    },
  });

  // Return record with splits
  return await recordDAO.getRecordWithSplits(record.id);
}

/**
 * Update an existing record
 * @param {number} userId - User ID updating the record
 * @param {number} recordId - Record ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated record with splits
 */
export async function updateRecord(userId, recordId, updates) {
  // Get existing record
  const existingRecord = await recordDAO.findById(recordId);
  if (!existingRecord) {
    const error = new Error('Record not found');
    error.statusCode = 404;
    throw error;
  }

  const existingSplits = await recordSplitDAO.getSplitsByRecordId(recordId);

  // Reverse old balances
  await updateFriendBalancesForRecord(recordId, true);

  // Prepare update data
  const updateData = {};
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.amount !== undefined) updateData.amount = updates.amount;
  if (updates.groupId !== undefined) updateData.groupId = updates.groupId || null;
  if (updates.paidBy !== undefined) updateData.paidBy = updates.paidBy;
  if (updates.category !== undefined) updateData.category = updates.category || null;
  if (updates.expenseDate !== undefined) {
    updateData.expenseDate = updates.expenseDate ? new Date(updates.expenseDate) : null;
  }

  // If splits are being updated, recalculate
  let newSplits = existingSplits;
  if (updates.participantIds !== undefined || updates.splitMode !== undefined || updates.splitData !== undefined) {
    const participantIds = updates.participantIds !== undefined ? updates.participantIds : 
      existingSplits.map(s => s.userId).filter(id => id !== existingRecord.paidBy);
    const paidBy = updates.paidBy !== undefined ? updates.paidBy : existingRecord.paidBy;
    const amount = updates.amount !== undefined ? updates.amount : existingRecord.amount;
    const splitMode = updates.splitMode !== undefined ? updates.splitMode : 'equal';
    const splitData = updates.splitData !== undefined ? updates.splitData : {};

    // Calculate new splits
    const splits = calculateSplits(amount, participantIds, paidBy, splitMode, splitData);

    // Delete old splits
    await recordSplitDAO.deleteByRecordId(recordId);

    // Create new splits
    newSplits = [];
    for (const [userId, splitAmount] of Object.entries(splits)) {
      const userIdNum = parseInt(userId);
      // Create split for all participants, including payer if they're in participantIds
      if (userIdNum === paidBy && participantIds.includes(userIdNum)) {
        // Payer is part of the split
        const split = await recordSplitDAO.create({
          recordId,
          userId: userIdNum,
          amount: splitAmount,
        });
        newSplits.push(split);
      } else if (userIdNum !== paidBy) {
        // Participant (not payer)
        const split = await recordSplitDAO.create({
          recordId,
          userId: userIdNum,
          amount: splitAmount,
        });
        newSplits.push(split);
      }
    }
  }

  // Update record
  const updatedRecord = await recordDAO.update(recordId, updateData);

  // Apply new balances
  await updateFriendBalancesForRecord(recordId, false);

  // Create history entry
  await recordHistoryDAO.create({
    recordId,
    action: 'updated',
    changedBy: userId,
    oldData: {
      record: existingRecord,
      splits: existingSplits,
    },
    newData: {
      record: updatedRecord,
      splits: newSplits,
    },
  });

  // Return updated record with splits
  return await recordDAO.getRecordWithSplits(recordId);
}

/**
 * Delete a record
 * @param {number} userId - User ID deleting the record
 * @param {number} recordId - Record ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteRecord(userId, recordId) {
  const existingRecord = await recordDAO.findById(recordId);
  if (!existingRecord) {
    const error = new Error('Record not found');
    error.statusCode = 404;
    throw error;
  }

  const existingSplits = await recordSplitDAO.getSplitsByRecordId(recordId);

  // Reverse balances
  await updateFriendBalancesForRecord(recordId, true);

  // Delete splits
  await recordSplitDAO.deleteByRecordId(recordId);

  // Create history entry before deletion
  await recordHistoryDAO.create({
    recordId,
    action: 'deleted',
    changedBy: userId,
    oldData: {
      record: existingRecord,
      splits: existingSplits,
    },
  });

  // Delete record
  const deleted = await recordDAO.delete(recordId);
  return deleted;
}

/**
 * Get record with details
 * @param {number} recordId - Record ID
 * @param {number} userId - User ID requesting (for authorization)
 * @returns {Promise<Object>} Record with splits
 */
export async function getRecordWithDetails(recordId, userId) {
  const record = await recordDAO.getRecordWithSplits(recordId);
  if (!record) {
    const error = new Error('Record not found');
    error.statusCode = 404;
    throw error;
  }

  return record;
}

/**
 * Get records for a user
 * @param {number} userId - User ID
 * @param {Object} filters - Optional filters
 * @param {number} [filters.groupId] - Filter by group ID
 * @returns {Promise<Array>} Array of records
 */
export async function getRecordsForUser(userId, filters = {}) {
  if (filters.groupId) {
    return await recordDAO.getRecordsByGroupId(filters.groupId);
  }
  
  // Get personal records and group records
  const personalRecords = await recordDAO.getPersonalRecordsByUserId(userId);
  // TODO: Get group records where user is a participant
  return personalRecords;
}
