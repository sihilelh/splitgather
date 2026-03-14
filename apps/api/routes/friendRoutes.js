import { Router } from 'express';
import * as friendController from '../controllers/friendController.js';
import { validateAddFriend } from '../middleware/validation/friend.validation.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const friendRouter = Router();

/**
 * GET /api/friends/search?q=query
 * Search users by name or email
 */
friendRouter.get('/search', authenticateToken, friendController.searchUsers);

/**
 * GET /api/friends
 * Get friends list with balances
 */
friendRouter.get('/', authenticateToken, friendController.getFriends);

/**
 * POST /api/friends
 * Add a friend
 */
friendRouter.post('/', authenticateToken, validateAddFriend, friendController.addFriend);

/**
 * GET /api/friends/balances
 * Get friend balances summary
 */
friendRouter.get('/balances', authenticateToken, friendController.getFriendBalances);

export default friendRouter;
