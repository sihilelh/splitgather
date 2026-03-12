import { db } from '../db/index.js';
import { friends, users } from '../db/schema.js';
import { eq, and, or } from 'drizzle-orm';

export const friendDAO = {
  /**
   * Create a new friend relationship
   * @param {Object} friendData - Friend relationship data
   * @param {number} friendData.userId - User ID
   * @param {number} friendData.friendId - Friend user ID
   * @param {string} [friendData.status='pending'] - Relationship status
   * @returns {Promise<Object>} Created friend relationship
   */
  async create(friendData) {
    const result = await db.insert(friends).values(friendData).returning();
    return result[0];
  },

  /**
   * Find friend relationship by ID
   * @param {number} id - Friend relationship ID
   * @returns {Promise<Object|null>} Friend relationship or null if not found
   */
  async findById(id) {
    const result = await db.select().from(friends).where(eq(friends.id, id)).limit(1);
    return result[0] || null;
  },

  /**
   * Find friend relationship between two users
   * @param {number} userId - First user ID
   * @param {number} friendId - Second user ID
   * @returns {Promise<Object|null>} Friend relationship or null if not found
   */
  async findByUsers(userId, friendId) {
    const result = await db
      .select()
      .from(friends)
      .where(
        or(
          and(eq(friends.userId, userId), eq(friends.friendId, friendId)),
          and(eq(friends.userId, friendId), eq(friends.friendId, userId))
        )
      )
      .limit(1);
    return result[0] || null;
  },

  /**
   * Get all friends for a user
   * @param {number} userId - User ID
   * @param {string} [status] - Optional status filter
   * @returns {Promise<Array>} Array of friend relationships
   */
  async getFriendsByUserId(userId, status = null) {
    let query = db
      .select({
        id: friends.id,
        userId: friends.userId,
        friendId: friends.friendId,
        status: friends.status,
        createdAt: friends.createdAt,
        friend: users,
      })
      .from(friends)
      .innerJoin(users, eq(friends.friendId, users.id))
      .where(eq(friends.userId, userId));

    if (status) {
      query = query.where(eq(friends.status, status));
    }

    return await query;
  },

  /**
   * Get all friend requests received by a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of friend relationships
   */
  async getFriendRequests(userId) {
    return await db
      .select({
        id: friends.id,
        userId: friends.userId,
        friendId: friends.friendId,
        status: friends.status,
        createdAt: friends.createdAt,
        requester: users,
      })
      .from(friends)
      .innerJoin(users, eq(friends.userId, users.id))
      .where(and(eq(friends.friendId, userId), eq(friends.status, 'pending')));
  },

  /**
   * Update friend relationship
   * @param {number} id - Friend relationship ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated friend relationship or null if not found
   */
  async update(id, updates) {
    const result = await db
      .update(friends)
      .set(updates)
      .where(eq(friends.id, id))
      .returning();
    return result[0] || null;
  },

  /**
   * Delete friend relationship
   * @param {number} id - Friend relationship ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const result = await db.delete(friends).where(eq(friends.id, id)).returning();
    return result.length > 0;
  },
};

export default friendDAO;
