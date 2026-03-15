/**
 * Validation middleware for settlement endpoints
 */

/**
 * Validate create settlement request
 */
export function validateCreateSettlement(req, res, next) {
  const { payerId, receiverId, amount } = req.body;

  if (!payerId || isNaN(payerId)) {
    return res.status(400).json({
      success: false,
      message: 'Payer ID is required and must be a number',
    });
  }

  if (!receiverId || isNaN(receiverId)) {
    return res.status(400).json({
      success: false,
      message: 'Receiver ID is required and must be a number',
    });
  }

  if (parseInt(payerId) === parseInt(receiverId)) {
    return res.status(400).json({
      success: false,
      message: 'Payer and receiver cannot be the same',
    });
  }

  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a positive number',
    });
  }

  next();
}

/**
 * Validate update settlement request
 */
export function validateUpdateSettlement(req, res, next) {
  const { id } = req.params;
  const updates = req.body;

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid settlement ID',
    });
  }

  // Validate optional fields if provided
  if (updates.amount !== undefined && (isNaN(updates.amount) || parseFloat(updates.amount) <= 0)) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a positive number',
    });
  }

  if (updates.payerId !== undefined && isNaN(updates.payerId)) {
    return res.status(400).json({
      success: false,
      message: 'Payer ID must be a number',
    });
  }

  if (updates.receiverId !== undefined && isNaN(updates.receiverId)) {
    return res.status(400).json({
      success: false,
      message: 'Receiver ID must be a number',
    });
  }

  if (updates.payerId !== undefined && updates.receiverId !== undefined) {
    if (parseInt(updates.payerId) === parseInt(updates.receiverId)) {
      return res.status(400).json({
        success: false,
        message: 'Payer and receiver cannot be the same',
      });
    }
  }

  next();
}

/**
 * Validate settlement ID parameter
 */
export function validateSettlementId(req, res, next) {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({
      success: false,
      message: 'Invalid settlement ID',
    });
  }

  next();
}
