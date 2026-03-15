/**
 * Validation middleware for record endpoints
 */

/**
 * Validate create record request
 */
export function validateCreateRecord(req, res, next) {
  const { description, amount, paidBy, participantIds, splitMode } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Description is required',
    });
  }

  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a positive number',
    });
  }

  if (!paidBy || isNaN(paidBy)) {
    return res.status(400).json({
      success: false,
      message: 'Payer ID is required and must be a number',
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

  // Validate split data based on mode
  if (splitMode === 'percentage') {
    const { splitData } = req.body;
    if (!splitData || typeof splitData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'splitData is required for percentage split mode',
      });
    }
  } else if (splitMode === 'custom') {
    const { splitData } = req.body;
    if (!splitData || typeof splitData !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'splitData is required for custom split mode',
      });
    }
  }

  next();
}

/**
 * Validate update record request
 */
export function validateUpdateRecord(req, res, next) {
  const { id } = req.params;
  const updates = req.body;

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid record ID',
    });
  }

  // Validate optional fields if provided
  if (updates.description !== undefined && (!updates.description || !updates.description.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Description cannot be empty',
    });
  }

  if (updates.amount !== undefined && (isNaN(updates.amount) || parseFloat(updates.amount) <= 0)) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a positive number',
    });
  }

  if (updates.splitMode !== undefined && !['equal', 'percentage', 'custom'].includes(updates.splitMode)) {
    return res.status(400).json({
      success: false,
      message: 'splitMode must be one of: equal, percentage, custom',
    });
  }

  next();
}

/**
 * Validate record ID parameter
 */
export function validateRecordId(req, res, next) {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid record ID',
    });
  }

  next();
}
