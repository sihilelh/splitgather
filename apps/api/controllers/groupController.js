import * as groupService from '../services/groupService.js';

/**
 * Create a new group
 * POST /api/groups
 * Body: { name, description?, icon?, memberIds? }
 */
export async function createGroup(req, res) {
  try {
    const { id: userId } = req.user;
    const { name, description, icon, memberIds } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required',
      });
    }

    const group = await groupService.createGroup(userId, {
      name,
      description,
      icon,
      memberIds: Array.isArray(memberIds) ? memberIds : [],
    });

    res.status(201).json({
      success: true,
      group,
      message: 'Group created successfully',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to create group',
    });
  }
}

/**
 * Get all groups for the current user
 * GET /api/groups
 */
export async function getUserGroups(req, res) {
  try {
    const { id: userId } = req.user;

    const groups = await groupService.getUserGroups(userId);

    res.status(200).json({
      success: true,
      groups,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to get groups',
    });
  }
}

/**
 * Get group by ID
 * GET /api/groups/:id
 */
export async function getGroupById(req, res) {
  try {
    const { id: userId } = req.user;
    const { id: groupId } = req.params;

    const groupIdNum = parseInt(groupId, 10);
    if (isNaN(groupIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID',
      });
    }

    const group = await groupService.getGroupById(groupIdNum, userId);

    res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to get group',
    });
  }
}

/**
 * Add members to a group
 * POST /api/groups/:id/members
 * Body: { memberIds: [number] }
 */
export async function addMembers(req, res) {
  try {
    const { id: userId } = req.user;
    const { id: groupId } = req.params;
    const { memberIds } = req.body;

    const groupIdNum = parseInt(groupId, 10);
    if (isNaN(groupIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID',
      });
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'memberIds must be a non-empty array',
      });
    }

    const group = await groupService.addMembersToGroup(groupIdNum, userId, memberIds);

    res.status(200).json({
      success: true,
      group,
      message: 'Members added successfully',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to add members',
    });
  }
}

/**
 * Remove a member from a group
 * DELETE /api/groups/:id/members/:memberId
 */
export async function removeMember(req, res) {
  try {
    const { id: userId } = req.user;
    const { id: groupId, memberId: memberIdParam } = req.params;

    const groupIdNum = parseInt(groupId, 10);
    const memberIdNum = parseInt(memberIdParam, 10);

    if (isNaN(groupIdNum) || isNaN(memberIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID or member ID',
      });
    }

    const group = await groupService.removeMemberFromGroup(groupIdNum, userId, memberIdNum);

    res.status(200).json({
      success: true,
      group,
      message: 'Member removed successfully',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to remove member',
    });
  }
}

/**
 * Exit a group
 * DELETE /api/groups/:id/exit
 */
export async function exitGroup(req, res) {
  try {
    const { id: userId } = req.user;
    const { id: groupId } = req.params;

    const groupIdNum = parseInt(groupId, 10);
    if (isNaN(groupIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID',
      });
    }

    await groupService.exitGroup(groupIdNum, userId);

    res.status(200).json({
      success: true,
      message: 'Exited group successfully',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to exit group',
    });
  }
}

/**
 * Search friends for adding to group
 * GET /api/groups/:id/friends/search?q=query
 */
export async function searchFriends(req, res) {
  try {
    const { id: userId } = req.user;
    const { id: groupId } = req.params;
    const { q: query } = req.query;

    const groupIdNum = parseInt(groupId, 10);
    if (isNaN(groupIdNum)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid group ID',
      });
    }

    if (!query || !query.trim()) {
      return res.status(200).json({
        success: true,
        results: [],
        count: 0,
      });
    }

    const results = await groupService.searchFriendsForGroup(userId, groupIdNum, query);

    res.status(200).json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to search friends',
    });
  }
}
