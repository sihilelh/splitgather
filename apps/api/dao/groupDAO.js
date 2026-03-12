import { db } from '../db/index.js';
import { groups, users, groupParticipants } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const groupDAO = {
  /**
   * Create a new group
   * @param {Object} groupData - Group data
   * @param {string} groupData.name - Group name
   * @param {string} [groupData.description] - Group description
   * @param {number} groupData.createdBy - Creator user ID
   * @returns {Promise<Object>} Created group
   */
  async create(groupData) {
    const result = await db.insert(groups).values(groupData).returning();
    return result[0];
  },

  /**
   * Find group by ID
   * @param {number} id - Group ID
   * @returns {Promise<Object|null>} Group or null if not found
   */
  async findById(id) {
    const result = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
    return result[0] || null;
  },

  /**
   * Get all groups
   * @returns {Promise<Array>} Array of groups
   */
  async findAll() {
    return await db.select().from(groups);
  },

  /**
   * Get groups created by a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of groups
   */
  async getGroupsByCreator(userId) {
    return await db.select().from(groups).where(eq(groups.createdBy, userId));
  },

  /**
   * Get groups a user participates in
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of groups
   */
  async getGroupsByParticipant(userId) {
    return await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        createdBy: groups.createdBy,
        createdAt: groups.createdAt,
        creator: users,
      })
      .from(groups)
      .innerJoin(groupParticipants, eq(groups.id, groupParticipants.groupId))
      .innerJoin(users, eq(groups.createdBy, users.id))
      .where(eq(groupParticipants.userId, userId));
  },

  /**
   * Update group
   * @param {number} id - Group ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated group or null if not found
   */
  async update(id, updates) {
    const result = await db
      .update(groups)
      .set(updates)
      .where(eq(groups.id, id))
      .returning();
    return result[0] || null;
  },

  /**
   * Delete group
   * @param {number} id - Group ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const result = await db.delete(groups).where(eq(groups.id, id)).returning();
    return result.length > 0;
  },
};

export default groupDAO;
