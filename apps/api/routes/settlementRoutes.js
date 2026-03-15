import { Router } from 'express';
import * as settlementController from '../controllers/settlementController.js';
import { validateCreateSettlement, validateUpdateSettlement, validateSettlementId } from '../middleware/validation/settlement.validation.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const settlementRouter = Router();

/**
 * POST /api/settlements
 * Create a new settlement
 */
settlementRouter.post('/', authenticateToken, validateCreateSettlement, settlementController.createSettlement);

/**
 * GET /api/settlements
 * Get settlements (optionally filtered by userId or groupId)
 */
settlementRouter.get('/', authenticateToken, settlementController.getSettlements);

/**
 * GET /api/settlements/:id
 * Get settlement by ID
 */
settlementRouter.get('/:id', authenticateToken, validateSettlementId, settlementController.getSettlementById);

/**
 * PUT /api/settlements/:id
 * Update a settlement
 */
settlementRouter.put('/:id', authenticateToken, validateSettlementId, validateUpdateSettlement, settlementController.updateSettlement);

/**
 * DELETE /api/settlements/:id
 * Delete a settlement
 */
settlementRouter.delete('/:id', authenticateToken, validateSettlementId, settlementController.deleteSettlement);

export default settlementRouter;
