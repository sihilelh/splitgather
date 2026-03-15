import * as settlementService from '../services/settlementService.js';

/**
 * Create a new settlement
 * POST /api/settlements
 * Body: { payerId, receiverId, amount, groupId?, note? }
 */
export async function createSettlement(req, res) {
  try {
    const { id: userId } = req.user;
    const { payerId, receiverId, amount, groupId, note } = req.body;

    if (!payerId || !receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Payer and receiver are required',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than zero',
      });
    }

    const settlement = await settlementService.createSettlement(userId, {
      payerId: parseInt(payerId),
      receiverId: parseInt(receiverId),
      amount: parseFloat(amount),
      groupId: groupId || null,
      note: note || null,
    });

    res.status(201).json({
      success: true,
      settlement,
      message: 'Settlement created successfully',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create settlement',
    });
  }
}

/**
 * Get settlement by ID
 * GET /api/settlements/:id
 */
export async function getSettlementById(req, res) {
  try {
    const { id: settlementId } = req.params;

    const settlementIdNum = parseInt(settlementId, 10);
    if (isNaN(settlementIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settlement ID',
      });
    }

    const settlementDAO = (await import('../dao/settlementDAO.js')).default;
    const settlement = await settlementDAO.findByIdWithUsers(settlementIdNum);

    if (!settlement) {
      return res.status(404).json({
        success: false,
        message: 'Settlement not found',
      });
    }

    res.status(200).json({
      success: true,
      settlement,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to get settlement',
    });
  }
}

/**
 * Update a settlement
 * PUT /api/settlements/:id
 * Body: { amount?, payerId?, receiverId?, groupId?, note? }
 */
export async function updateSettlement(req, res) {
  try {
    const { id: userId } = req.user;
    const { id: settlementId } = req.params;
    const updates = req.body;

    const settlementIdNum = parseInt(settlementId, 10);
    if (isNaN(settlementIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settlement ID',
      });
    }

    // Prepare updates
    const updateData = {};
    if (updates.amount !== undefined) updateData.amount = parseFloat(updates.amount);
    if (updates.payerId !== undefined) updateData.payerId = parseInt(updates.payerId);
    if (updates.receiverId !== undefined) updateData.receiverId = parseInt(updates.receiverId);
    if (updates.groupId !== undefined) updateData.groupId = updates.groupId || null;
    if (updates.note !== undefined) updateData.note = updates.note || null;

    const settlement = await settlementService.updateSettlement(userId, settlementIdNum, updateData);

    res.status(200).json({
      success: true,
      settlement,
      message: 'Settlement updated successfully',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update settlement',
    });
  }
}

/**
 * Delete a settlement
 * DELETE /api/settlements/:id
 */
export async function deleteSettlement(req, res) {
  try {
    const { id: userId } = req.user;
    const { id: settlementId } = req.params;

    const settlementIdNum = parseInt(settlementId, 10);
    if (isNaN(settlementIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid settlement ID',
      });
    }

    await settlementService.deleteSettlement(userId, settlementIdNum);

    res.status(200).json({
      success: true,
      message: 'Settlement deleted successfully',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete settlement',
    });
  }
}

/**
 * Get settlements
 * GET /api/settlements?userId=?:groupId=?
 */
export async function getSettlements(req, res) {
  try {
    const { id: userId } = req.user;
    const { userId: otherUserId, groupId } = req.query;

    let settlements;

    if (groupId) {
      const groupIdNum = parseInt(groupId, 10);
      if (isNaN(groupIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid group ID',
        });
      }
      settlements = await settlementService.getSettlementsByGroup(groupIdNum, userId);
    } else if (otherUserId) {
      const otherUserIdNum = parseInt(otherUserId, 10);
      if (isNaN(otherUserIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
      }
      settlements = await settlementService.getSettlementsByUsers(userId, otherUserIdNum);
    } else {
      // Get all settlements for current user
      const settlementDAO = (await import('../dao/settlementDAO.js')).default;
      settlements = await settlementDAO.getSettlementsByUser(userId);
    }

    res.status(200).json({
      success: true,
      settlements,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to get settlements',
    });
  }
}
