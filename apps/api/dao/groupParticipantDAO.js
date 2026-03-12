import { db } from '../db/index.js';
import { groupParticipants, groups, users } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export const groupParticipantDAO = {
  /**
   * Add a participant to a group
   * @param {Object} participantData - Participant data
   * @param {number} participantData.groupId - Group ID
   * @param {number} participantData.userId - User ID
   * @returns {Promise<Object>} Created participant record
   */
  async create(participantData) {
    const result = await db.insert(groupParticipants).values(participantData).returning();
    return result[0];
  },

  /**
   * Find participant by ID
   * @param {number} id - Participant ID
   * @returns {Promise<Object|null>} Participant or null if not found
   */
  async findById(id) {
    const result = await db
      .select()
      .from(groupParticipants)
      .where(eq(groupParticipants.id, id))
      .limit(1);
    return result[0] || null;
  },

  /**
   * Find participant by group and user
   * @param {number} groupId - Group ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Participant or null if not found
   */
  async findByGroupAndUser(groupId, userId) {
    const result = await db
      .select()
      .from(groupParticipants)
      .where(and(eq(groupParticipants.groupId, groupId), eq(groupParticipants.userId, userId)))
      .limit(1);
    return result[0] || null;
  },

  /**
   * Get all participants in a group
   * @param {number} groupId - Group ID
   * @returns {Promise<Array>} Array of participants with user details
   */
  async getParticipantsByGroupId(groupId) {
    return await db
      .select({
        id: groupParticipants.id,
        groupId: groupParticipants.groupId,
        userId: groupParticipants.userId,
        joinedAt: groupParticipants.joinedAt,
        user: users,
      })
      .from(groupParticipants)
      .innerJoin(users, eq(groupParticipants.userId, users.id))
      .where(eq(groupParticipants.groupId, groupId));
  },

  /**
   * Get all groups a user participates in
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of participants with group details
   */
  async getGroupsByUserId(userId) {
    return await db
      .select({
        id: groupParticipants.id,
        groupId: groupParticipants.groupId,
        userId: groupParticipants.userId,
        joinedAt: groupParticipants.joinedAt,
        group: groups,
      })
      .from(groupParticipants)
      .innerJoin(groups, eq(groupParticipants.groupId, groups.id))
      .where(eq(groupParticipants.userId, userId));
  },

  /**
   * Remove a participant from a group
   * @param {number} id - Participant ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const result = await db
      .delete(groupParticipants)
      .where(eq(groupParticipants.id, id))
      .returning();
    return result.length > 0;
  },

  /**
   * Remove a user from a group
   * @param {number} groupId - Group ID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async removeUserFromGroup(groupId, userId) {
    const result = await db
      .delete(groupParticipants)
      .where(and(eq(groupParticipants.groupId, groupId), eq(groupParticipants.userId, userId)))
      .returning();
    return result.length > 0;
  },
};

export default groupParticipantDAO;
