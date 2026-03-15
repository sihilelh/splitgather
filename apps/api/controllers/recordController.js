import * as recordService from '../services/recordService.js';

/**
 * Create a new expense record
 * POST /api/records
 * Body: { description, amount, groupId?, paidBy, participantIds, splitMode, splitData?, category?, expenseDate? }
 */
export async function createRecord(req, res) {
  try {
    const { id: userId } = req.user;
    const { description, amount, groupId, paidBy, participantIds, splitMode, splitData, category, expenseDate } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Description is required',
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than zero',
      });
    }

    if (!paidBy) {
      return res.status(400).json({
        success: false,
        message: 'Payer is required',
      });
    }

    if (!Array.isArray(participantIds)) {
      return res.status(400).json({
        success: false,
        message: 'participantIds must be an array',
      });
    }

    if (!splitMode || !['equal', 'percentage', 'custom'].includes(splitMode)) {
      return res.status(400).json({
        success: false,
        message: 'splitMode must be one of: equal, percentage, custom',
      });
    }

    const record = await recordService.createRecord(userId, {
      description: description.trim(),
      amount: parseFloat(amount),
      groupId: groupId || null,
      paidBy: parseInt(paidBy),
      participantIds: participantIds.map(id => parseInt(id)),
      splitMode,
      splitData: splitData || {},
      category: category || null,
      expenseDate: expenseDate || null,
    });

    res.status(201).json({
      success: true,
      record,
      message: 'Record created successfully',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create record',
    });
  }
}

/**
 * Get record by ID
 * GET /api/records/:id
 */
export async function getRecordById(req, res) {
  try {
    const { id: userId } = req.user;
    const { id: recordId } = req.params;

    const recordIdNum = parseInt(recordId, 10);
    if (isNaN(recordIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID',
      });
    }

    const record = await recordService.getRecordWithDetails(recordIdNum, userId);

    res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to get record',
    });
  }
}

/**
 * Update a record
 * PUT /api/records/:id
 * Body: { description?, amount?, groupId?, paidBy?, participantIds?, splitMode?, splitData?, category?, expenseDate? }
 */
export async function updateRecord(req, res) {
  try {
    const { id: userId } = req.user;
    const { id: recordId } = req.params;
    const updates = req.body;

    const recordIdNum = parseInt(recordId, 10);
    if (isNaN(recordIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID',
      });
    }

    // Prepare updates
    const updateData = {};
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = parseFloat(updates.amount);
    if (updates.groupId !== undefined) updateData.groupId = updates.groupId || null;
    if (updates.paidBy !== undefined) updateData.paidBy = parseInt(updates.paidBy);
    if (updates.participantIds !== undefined) {
      updateData.participantIds = Array.isArray(updates.participantIds)
        ? updates.participantIds.map(id => parseInt(id))
        : [];
    }
    if (updates.splitMode !== undefined) updateData.splitMode = updates.splitMode;
    if (updates.splitData !== undefined) updateData.splitData = updates.splitData || {};
    if (updates.category !== undefined) updateData.category = updates.category || null;
    if (updates.expenseDate !== undefined) updateData.expenseDate = updates.expenseDate || null;

    const record = await recordService.updateRecord(userId, recordIdNum, updateData);

    res.status(200).json({
      success: true,
      record,
      message: 'Record updated successfully',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to update record',
    });
  }
}

/**
 * Delete a record
 * DELETE /api/records/:id
 */
export async function deleteRecord(req, res) {
  try {
    const { id: userId } = req.user;
    const { id: recordId } = req.params;

    const recordIdNum = parseInt(recordId, 10);
    if (isNaN(recordIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID',
      });
    }

    await recordService.deleteRecord(userId, recordIdNum);

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to delete record',
    });
  }
}

/**
 * Get records for the current user
 * GET /api/records?groupId=?
 */
export async function getRecords(req, res) {
  try {
    const { id: userId } = req.user;
    const { groupId } = req.query;

    console.log('[getRecords Controller] Request received:', {
      userId,
      groupId: groupId || 'none',
      query: req.query,
    });

    const filters = {};
    if (groupId) {
      const groupIdNum = parseInt(groupId, 10);
      if (!isNaN(groupIdNum)) {
        filters.groupId = groupIdNum;
      }
    }

    console.log('[getRecords Controller] Filters:', filters);

    const records = await recordService.getRecordsForUser(userId, filters);

    console.log('[getRecords Controller] Records returned:', {
      count: records?.length || 0,
      records: records?.slice(0, 2), // Log first 2 records for debugging
    });

    res.status(200).json({
      success: true,
      records,
    });
  } catch (error) {
    console.error('[getRecords Controller] Error:', error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to get records',
    });
  }
}
