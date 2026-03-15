import { Router } from 'express';
import * as recordController from '../controllers/recordController.js';
import { validateCreateRecord, validateUpdateRecord, validateRecordId } from '../middleware/validation/record.validation.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const recordRouter = Router();

/**
 * POST /api/records
 * Create a new expense record
 */
recordRouter.post('/', authenticateToken, validateCreateRecord, recordController.createRecord);

/**
 * GET /api/records
 * Get records for the current user (optionally filtered by groupId)
 */
recordRouter.get('/', authenticateToken, recordController.getRecords);

/**
 * GET /api/records/:id
 * Get record by ID
 */
recordRouter.get('/:id', authenticateToken, validateRecordId, recordController.getRecordById);

/**
 * PUT /api/records/:id
 * Update a record
 */
recordRouter.put('/:id', authenticateToken, validateRecordId, validateUpdateRecord, recordController.updateRecord);

/**
 * DELETE /api/records/:id
 * Delete a record
 */
recordRouter.delete('/:id', authenticateToken, validateRecordId, recordController.deleteRecord);

export default recordRouter;
