import groupDAO from '../dao/groupDAO.js';
import groupParticipantDAO from '../dao/groupParticipantDAO.js';
import friendDAO from '../dao/friendDAO.js';
import userDAO from '../dao/userDAO.js';

/**
 * Create a new group with creator as first participant
 * @param {number} userId - Creator user ID
 * @param {Object} groupData - Group data
 * @param {string} groupData.name - Group name
 * @param {string} [groupData.description] - Group description
 * @param {string} [groupData.icon] - Group icon/emoji
 * @param {Array<number>} [groupData.memberIds] - Array of friend IDs to add as members
 * @returns {Promise<Object>} Created group with participants
 */
export async function createGroup(userId, groupData) {
  const { name, description, icon, memberIds = [] } = groupData;

  if (!name || !name.trim()) {
    const error = new Error('Group name is required');
    error.statusCode = 400;
    throw error;
  }

  // Verify user exists
  const user = await userDAO.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Create group
  const group = await groupDAO.create({
    name: name.trim(),
    description: description?.trim() || null,
    icon: icon || null,
    createdBy: userId,
  });

  // Add creator as first participant
  await groupParticipantDAO.create({
    groupId: group.id,
    userId: userId,
  });

  // Add selected members (verify they are friends first)
  const addedMembers = [];
  for (const memberId of memberIds) {
    // Verify member is a friend
    const friendship = await friendDAO.findByUsers(userId, memberId);
    if (!friendship) {
      continue; // Skip if not a friend
    }

    // Check if already a participant
    const existing = await groupParticipantDAO.findByGroupAndUser(group.id, memberId);
    if (!existing) {
      await groupParticipantDAO.create({
        groupId: group.id,
        userId: memberId,
      });
      addedMembers.push(memberId);
    }
  }

  // Fetch group with participants
  return await getGroupById(group.id, userId);
}

/**
 * Get all groups a user participates in (created + joined)
 * @param {number} userId - User ID
 * @returns {Promise<Array>} Array of groups with participant count
 */
export async function getUserGroups(userId) {
  // Get groups where user is a participant
  const participantGroups = await groupParticipantDAO.getGroupsByUserId(userId);
  
  // Transform to include participant count and basic info
  const groups = await Promise.all(
    participantGroups.map(async (participant) => {
      const group = participant.group;
      const participants = await groupParticipantDAO.getParticipantsByGroupId(group.id);
      
      return {
        id: group.id,
        name: group.name,
        description: group.description,
        icon: group.icon,
        createdBy: group.createdBy,
        createdAt: group.createdAt,
        participantCount: participants.length,
      };
    })
  );

  return groups;
}

/**
 * Get group details with participants and balance
 * @param {number} groupId - Group ID
 * @param {number} userId - User ID (for balance calculation)
 * @returns {Promise<Object>} Group with participants and user balance
 */
export async function getGroupById(groupId, userId) {
  const group = await groupDAO.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify user is a participant
  const userParticipant = await groupParticipantDAO.findByGroupAndUser(groupId, userId);
  if (!userParticipant) {
    const error = new Error('You are not a member of this group');
    error.statusCode = 403;
    throw error;
  }

  // Get all participants with user details
  const participants = await groupParticipantDAO.getParticipantsByGroupId(groupId);

  // Calculate user's balance in group (from owsAmount)
  const userBalance = userParticipant.owsAmount || 0.0;

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    icon: group.icon,
    createdBy: group.createdBy,
    createdAt: group.createdAt,
    participants: participants.map(p => ({
      id: p.id,
      userId: p.userId,
      user: p.user,
      owsAmount: p.owsAmount || 0.0,
      joinedAt: p.joinedAt,
    })),
    userBalance,
  };
}

/**
 * Add multiple friends to a group
 * @param {number} groupId - Group ID
 * @param {number} userId - User ID (must be group member)
 * @param {Array<number>} memberIds - Array of friend IDs to add
 * @returns {Promise<Object>} Updated group with participants
 */
export async function addMembersToGroup(groupId, userId, memberIds) {
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    const error = new Error('memberIds must be a non-empty array');
    error.statusCode = 400;
    throw error;
  }

  // Verify group exists
  const group = await groupDAO.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify user is a participant
  const userParticipant = await groupParticipantDAO.findByGroupAndUser(groupId, userId);
  if (!userParticipant) {
    const error = new Error('You are not a member of this group');
    error.statusCode = 403;
    throw error;
  }

  // Get existing participant IDs
  const existingParticipants = await groupParticipantDAO.getParticipantsByGroupId(groupId);
  const existingParticipantIds = existingParticipants.map(p => p.userId);

  // Add new members (verify they are friends and not already participants)
  const addedMembers = [];
  for (const memberId of memberIds) {
    // Verify member is a friend
    const friendship = await friendDAO.findByUsers(userId, memberId);
    if (!friendship) {
      continue; // Skip if not a friend
    }

    // Skip if already a participant
    if (existingParticipantIds.includes(memberId)) {
      continue;
    }

    await groupParticipantDAO.create({
      groupId: groupId,
      userId: memberId,
    });
    addedMembers.push(memberId);
  }

  // Return updated group
  return await getGroupById(groupId, userId);
}

/**
 * Remove a member from a group
 * @param {number} groupId - Group ID
 * @param {number} userId - User ID (must be group member)
 * @param {number} memberIdToRemove - User ID to remove from group
 * @returns {Promise<Object>} Updated group with participants
 */
export async function removeMemberFromGroup(groupId, userId, memberIdToRemove) {
  // Verify group exists
  const group = await groupDAO.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify user is a participant
  const userParticipant = await groupParticipantDAO.findByGroupAndUser(groupId, userId);
  if (!userParticipant) {
    const error = new Error('You are not a member of this group');
    error.statusCode = 403;
    throw error;
  }

  // Verify member to remove exists in group
  const memberParticipant = await groupParticipantDAO.findByGroupAndUser(groupId, memberIdToRemove);
  if (!memberParticipant) {
    const error = new Error('Member is not in this group');
    error.statusCode = 404;
    throw error;
  }

  // Prevent removing the creator (optional business rule)
  if (group.createdBy === memberIdToRemove) {
    const error = new Error('Cannot remove the group creator');
    error.statusCode = 400;
    throw error;
  }

  // Remove member
  await groupParticipantDAO.removeUserFromGroup(groupId, memberIdToRemove);

  // Return updated group
  return await getGroupById(groupId, userId);
}

/**
 * User exits a group
 * @param {number} groupId - Group ID
 * @param {number} userId - User ID leaving the group
 * @returns {Promise<boolean>} True if successfully exited
 */
export async function exitGroup(groupId, userId) {
  // Verify group exists
  const group = await groupDAO.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  // Verify user is a participant
  const userParticipant = await groupParticipantDAO.findByGroupAndUser(groupId, userId);
  if (!userParticipant) {
    const error = new Error('You are not a member of this group');
    error.statusCode = 403;
    throw error;
  }

  // Prevent creator from exiting (optional business rule - or allow if they want)
  // For now, we'll allow creator to exit
  // If you want to prevent: if (group.createdBy === userId) { throw error }

  // Remove user from group
  const removed = await groupParticipantDAO.removeUserFromGroup(groupId, userId);
  return removed;
}

/**
 * Search friends for adding to group (excludes existing members)
 * @param {number} userId - User ID
 * @param {number} groupId - Group ID
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of friends matching query, excluding group members
 */
export async function searchFriendsForGroup(userId, groupId, query) {
  if (!query || !query.trim()) {
    return [];
  }

  // Verify group exists
  const group = await groupDAO.findById(groupId);
  if (!group) {
    const error = new Error('Group not found');
    error.statusCode = 404;
    throw error;
  }

  // Get existing group member IDs
  const participants = await groupParticipantDAO.getParticipantsByGroupId(groupId);
  const memberIds = participants.map(p => p.userId);

  // Search friends
  const friends = await friendDAO.getFriendsWithBalances(userId);
  
  // Filter out existing members and search by name
  const searchPattern = query.trim().toLowerCase();
  const filtered = friends
    .filter(f => {
      // Exclude existing members
      if (memberIds.includes(f.friendId)) {
        return false;
      }
      // Search by name
      const name = f.friend.name.toLowerCase();
      return name.includes(searchPattern);
    })
    .slice(0, 10) // Limit to 10 results
    .map(f => ({
      id: f.friendId,
      name: f.friend.name,
      email: f.friend.email,
    }));

  return filtered;
}
