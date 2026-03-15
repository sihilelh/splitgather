import settlementDAO from '../dao/settlementDAO.js';
import friendDAO from '../dao/friendDAO.js';
import userDAO from '../dao/userDAO.js';
import * as groupService from './groupService.js';

/**
 * Validate settlement amount
 * @param {number} payerId - User ID who is paying
 * @param {number} receiverId - User ID who is receiving
 * @param {number} amount - Settlement amount
 * @returns {Promise<Object>} Validation result with isValid and currentBalance
 */
export async function validateSettlementAmount(payerId, receiverId, amount) {
  // Validate users exist
  const payer = await userDAO.findById(payerId);
  if (!payer) {
    const error = new Error('Payer not found');
    error.statusCode = 404;
    throw error;
  }

  const receiver = await userDAO.findById(receiverId);
  if (!receiver) {
    const error = new Error('Receiver not found');
    error.statusCode = 404;
    throw error;
  }

  // Get friendship
  const friendRecord = await friendDAO.findByUsers(payerId, receiverId);
  if (!friendRecord) {
    const error = new Error('Friendship not found');
    error.statusCode = 404;
    throw error;
  }

  // Calculate balance from payer's perspective
  let currentBalance;
  if (friendRecord.userAId === payerId) {
    currentBalance = friendRecord.userAowsB; // Positive = payer owes receiver
  } else {
    currentBalance = -friendRecord.userAowsB; // Flipped: positive = payer owes receiver
  }

  // Validate amount
  if (amount <= 0) {
    return {
      isValid: false,
      currentBalance,
      error: 'Settlement amount must be greater than zero',
    };
  }

  if (currentBalance <= 0) {
    return {
      isValid: false,
      currentBalance,
      error: 'Payer does not owe receiver anything',
    };
  }

  if (amount > currentBalance) {
    return {
      isValid: false,
      currentBalance,
      error: `Settlement amount (${amount}) exceeds outstanding balance (${currentBalance})`,
    };
  }

  return {
    isValid: true,
    currentBalance,
  };
}

/**
 * Create a settlement
 * @param {number} userId - User ID creating the settlement
 * @param {Object} settlementData - Settlement data
 * @param {number} settlementData.payerId - User ID who is paying
 * @param {number} settlementData.receiverId - User ID who is receiving
 * @param {number} settlementData.amount - Settlement amount
 * @param {number} [settlementData.groupId] - Optional group ID
 * @param {string} [settlementData.note] - Optional note
 * @returns {Promise<Object>} Created settlement
 */
export async function createSettlement(userId, settlementData) {
  const { payerId, receiverId, amount, groupId, note } = settlementData;

  // Validate users are different
  if (payerId === receiverId) {
    const error = new Error('Payer and receiver cannot be the same');
    error.statusCode = 400;
    throw error;
  }

  // Validate settlement amount
  const validation = await validateSettlementAmount(payerId, receiverId, amount);
  if (!validation.isValid) {
    const error = new Error(validation.error);
    error.statusCode = 400;
    throw error;
  }

  // If groupId is provided, validate both users are in the group
  if (groupId) {
    try {
      const group = await groupService.getGroupById(groupId, userId);
      const participantIds = group.participants.map(p => p.userId);
      if (!participantIds.includes(payerId) || !participantIds.includes(receiverId)) {
        const error = new Error('Both users must be members of the group');
        error.statusCode = 400;
        throw error;
      }
    } catch (err) {
      if (err.statusCode) throw err;
      const error = new Error('Group not found or access denied');
      error.statusCode = 404;
      throw error;
    }
  }

  // Create settlement
  const settlement = await settlementDAO.create({
    payerId,
    receiverId,
    amount,
    groupId: groupId || null,
    note: note || null,
    createdBy: userId,
  });

  // Update friend balance: decrease what payer owes receiver
  // If payer is userA, decrease userAowsB
  // If payer is userB, increase userAowsB (which decreases what userB owes userA)
  await friendDAO.updateBalance(payerId, receiverId, -amount);

  return await settlementDAO.findByIdWithUsers(settlement.id);
}

/**
 * Update a settlement
 * @param {number} userId - User ID updating the settlement
 * @param {number} settlementId - Settlement ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated settlement
 */
export async function updateSettlement(userId, settlementId, updates) {
  // Get existing settlement
  const existingSettlement = await settlementDAO.findById(settlementId);
  if (!existingSettlement) {
    const error = new Error('Settlement not found');
    error.statusCode = 404;
    throw error;
  }

  // Reverse old settlement effect
  await friendDAO.updateBalance(
    existingSettlement.payerId,
    existingSettlement.receiverId,
    existingSettlement.amount
  );

  // Prepare update data
  const updateData = {};
  let newAmount = existingSettlement.amount;
  let newPayerId = existingSettlement.payerId;
  let newReceiverId = existingSettlement.receiverId;

  if (updates.amount !== undefined) {
    newAmount = updates.amount;
    updateData.amount = updates.amount;
  }
  if (updates.payerId !== undefined) {
    newPayerId = updates.payerId;
    updateData.payerId = updates.payerId;
  }
  if (updates.receiverId !== undefined) {
    newReceiverId = updates.receiverId;
    updateData.receiverId = updates.receiverId;
  }
  if (updates.groupId !== undefined) {
    updateData.groupId = updates.groupId || null;
  }
  if (updates.note !== undefined) {
    updateData.note = updates.note || null;
  }

  // If payer/receiver changed, we need to handle balance updates differently
  if (updates.payerId !== undefined || updates.receiverId !== undefined) {
    // Validate new settlement
    const validation = await validateSettlementAmount(newPayerId, newReceiverId, newAmount);
    if (!validation.isValid) {
      // Restore old balance
      await friendDAO.updateBalance(
        existingSettlement.payerId,
        existingSettlement.receiverId,
        -existingSettlement.amount
      );
      const error = new Error(validation.error);
      error.statusCode = 400;
      throw error;
    }
  } else {
    // Validate new amount
    const validation = await validateSettlementAmount(newPayerId, newReceiverId, newAmount);
    if (!validation.isValid) {
      // Restore old balance
      await friendDAO.updateBalance(
        existingSettlement.payerId,
        existingSettlement.receiverId,
        -existingSettlement.amount
      );
      const error = new Error(validation.error);
      error.statusCode = 400;
      throw error;
    }
  }

  // Update settlement
  const updatedSettlement = await settlementDAO.update(settlementId, updateData);

  // Apply new settlement effect
  await friendDAO.updateBalance(newPayerId, newReceiverId, -newAmount);

  return await settlementDAO.findByIdWithUsers(settlementId);
}

/**
 * Delete a settlement
 * @param {number} userId - User ID deleting the settlement
 * @param {number} settlementId - Settlement ID
 * @returns {Promise<boolean>} True if deleted
 */
export async function deleteSettlement(userId, settlementId) {
  const settlement = await settlementDAO.findById(settlementId);
  if (!settlement) {
    const error = new Error('Settlement not found');
    error.statusCode = 404;
    throw error;
  }

  // Reverse settlement effect
  await friendDAO.updateBalance(
    settlement.payerId,
    settlement.receiverId,
    settlement.amount
  );

  // Delete settlement
  return await settlementDAO.delete(settlementId);
}

/**
 * Get settlements between two users
 * @param {number} userId1 - First user ID
 * @param {number} userId2 - Second user ID
 * @returns {Promise<Array>} Array of settlements
 */
export async function getSettlementsByUsers(userId1, userId2) {
  const settlements = await settlementDAO.getSettlementsByUsers(userId1, userId2);
  
  // Get receiver details for each settlement
  const settlementsWithReceivers = await Promise.all(
    settlements.map(async (settlement) => {
      const receiver = await userDAO.findById(settlement.receiverId);
      return {
        ...settlement,
        receiver,
      };
    })
  );

  return settlementsWithReceivers;
}

/**
 * Get settlements in a group
 * @param {number} groupId - Group ID
 * @param {number} userId - User ID (for authorization)
 * @returns {Promise<Array>} Array of settlements
 */
export async function getSettlementsByGroup(groupId, userId) {
  // Verify user has access to group
  try {
    await groupService.getGroupById(groupId, userId);
  } catch (err) {
    if (err.statusCode) throw err;
    const error = new Error('Group not found or access denied');
    error.statusCode = 404;
    throw error;
  }

  const settlements = await settlementDAO.getSettlementsByGroup(groupId);
  
  // Get receiver details for each settlement
  const settlementsWithReceivers = await Promise.all(
    settlements.map(async (settlement) => {
      const receiver = await userDAO.findById(settlement.receiverId);
      return {
        ...settlement,
        receiver,
      };
    })
  );

  return settlementsWithReceivers;
}
