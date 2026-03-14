/**
 * Validation middleware for group routes
 */

/**
 * Validate create group request
 */
export function validateCreateGroup(req, res, next) {
  const { name } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Group name is required and must be a non-empty string',
    });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: 'Group name must be 100 characters or less',
    });
  }

  // Validate optional fields
  if (req.body.description && typeof req.body.description !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Description must be a string',
    });
  }

  if (req.body.icon && typeof req.body.icon !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Icon must be a string',
    });
  }

  if (req.body.memberIds && !Array.isArray(req.body.memberIds)) {
    return res.status(400).json({
      success: false,
      message: 'memberIds must be an array',
    });
  }

  if (req.body.memberIds) {
    const invalidIds = req.body.memberIds.filter(id => typeof id !== 'number' || id <= 0);
    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'All memberIds must be positive numbers',
      });
    }
  }

  next();
}

/**
 * Validate add members request
 */
export function validateAddMembers(req, res, next) {
  const { memberIds } = req.body;

  if (!Array.isArray(memberIds)) {
    return res.status(400).json({
      success: false,
      message: 'memberIds must be an array',
    });
  }

  if (memberIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'memberIds must contain at least one member ID',
    });
  }

  const invalidIds = memberIds.filter(id => typeof id !== 'number' || id <= 0);
  if (invalidIds.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'All memberIds must be positive numbers',
    });
  }

  next();
}
