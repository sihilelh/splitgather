import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import * as groupController from '../controllers/groupController.js';
import { validateCreateGroup, validateAddMembers } from '../middleware/validation/group.validation.js';

const groupRouter = Router();

// All routes require authentication
groupRouter.use(authenticateToken);

// Create a new group
groupRouter.post('/', validateCreateGroup, groupController.createGroup);

// Get all groups for current user
groupRouter.get('/', groupController.getUserGroups);

// Get group by ID
groupRouter.get('/:id', groupController.getGroupById);

// Add members to group
groupRouter.post('/:id/members', validateAddMembers, groupController.addMembers);

// Remove member from group
groupRouter.delete('/:id/members/:memberId', groupController.removeMember);

// Exit group
groupRouter.delete('/:id/exit', groupController.exitGroup);

// Search friends for adding to group
groupRouter.get('/:id/friends/search', groupController.searchFriends);

export default groupRouter;
