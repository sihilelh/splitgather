import { db } from '../db/index.js';
import { settlements, users, groups } from '../db/schema.js';
import { eq, and, or } from 'drizzle-orm';

export const settlementDAO = {
  /**
   * Create a new settlement
   * @param {Object} settlementData - Settlement data
   * @param {number} settlementData.payerId - User ID who is paying
   * @param {number} settlementData.receiverId - User ID who is receiving
   * @param {number} settlementData.amount - Settlement amount
   * @param {number} [settlementData.groupId] - Optional group ID
   * @param {string} [settlementData.note] - Optional note
   * @param {number} settlementData.createdBy - User ID who created the settlement
   * @returns {Promise<Object>} Created settlement
   */
  async create(settlementData) {
    const result = await db.insert(settlements).values(settlementData).returning();
    return result[0];
  },

  /**
   * Find settlement by ID
   * @param {number} id - Settlement ID
   * @returns {Promise<Object|null>} Settlement or null if not found
   */
  async findById(id) {
    const result = await db.select().from(settlements).where(eq(settlements.id, id)).limit(1);
    return result[0] || null;
  },

  /**
   * Get settlement with payer and receiver details
   * @param {number} id - Settlement ID
   * @returns {Promise<Object|null>} Settlement with user details or null if not found
   */
  async findByIdWithUsers(id) {
    const result = await db
      .select({
        id: settlements.id,
        payerId: settlements.payerId,
        receiverId: settlements.receiverId,
        amount: settlements.amount,
        groupId: settlements.groupId,
        note: settlements.note,
        createdBy: settlements.createdBy,
        createdAt: settlements.createdAt,
        payer: users,
      })
      .from(settlements)
      .innerJoin(users, eq(settlements.payerId, users.id))
      .where(eq(settlements.id, id))
      .limit(1);

    if (result.length === 0) return null;

    const settlement = result[0];
    
    // Get receiver details
    const receiverResult = await db
      .select()
      .from(users)
      .where(eq(users.id, settlement.receiverId))
      .limit(1);

    return {
      ...settlement,
      receiver: receiverResult[0] || null,
    };
  },

  /**
   * Get settlements between two users
   * @param {number} userId1 - First user ID
   * @param {number} userId2 - Second user ID
   * @returns {Promise<Array>} Array of settlements
   */
  async getSettlementsByUsers(userId1, userId2) {
    return await db
      .select({
        id: settlements.id,
        payerId: settlements.payerId,
        receiverId: settlements.receiverId,
        amount: settlements.amount,
        groupId: settlements.groupId,
        note: settlements.note,
        createdBy: settlements.createdBy,
        createdAt: settlements.createdAt,
        payer: users,
      })
      .from(settlements)
      .innerJoin(users, eq(settlements.payerId, users.id))
      .where(
        or(
          and(eq(settlements.payerId, userId1), eq(settlements.receiverId, userId2)),
          and(eq(settlements.payerId, userId2), eq(settlements.receiverId, userId1))
        )
      )
      .orderBy(settlements.createdAt);
  },

  /**
   * Get settlements in a group
   * @param {number} groupId - Group ID
   * @returns {Promise<Array>} Array of settlements
   */
  async getSettlementsByGroup(groupId) {
    return await db
      .select({
        id: settlements.id,
        payerId: settlements.payerId,
        receiverId: settlements.receiverId,
        amount: settlements.amount,
        groupId: settlements.groupId,
        note: settlements.note,
        createdBy: settlements.createdBy,
        createdAt: settlements.createdAt,
        payer: users,
      })
      .from(settlements)
      .innerJoin(users, eq(settlements.payerId, users.id))
      .where(eq(settlements.groupId, groupId))
      .orderBy(settlements.createdAt);
  },

  /**
   * Get all settlements for a user (as payer or receiver)
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of settlements
   */
  async getSettlementsByUser(userId) {
    return await db
      .select({
        id: settlements.id,
        payerId: settlements.payerId,
        receiverId: settlements.receiverId,
        amount: settlements.amount,
        groupId: settlements.groupId,
        note: settlements.note,
        createdBy: settlements.createdBy,
        createdAt: settlements.createdAt,
        payer: users,
      })
      .from(settlements)
      .innerJoin(users, eq(settlements.payerId, users.id))
      .where(
        or(
          eq(settlements.payerId, userId),
          eq(settlements.receiverId, userId)
        )
      )
      .orderBy(settlements.createdAt);
  },

  /**
   * Update settlement
   * @param {number} id - Settlement ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated settlement or null if not found
   */
  async update(id, updates) {
    const result = await db
      .update(settlements)
      .set(updates)
      .where(eq(settlements.id, id))
      .returning();
    return result[0] || null;
  },

  /**
   * Delete settlement
   * @param {number} id - Settlement ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const result = await db.delete(settlements).where(eq(settlements.id, id)).returning();
    return result.length > 0;
  },
};

export default settlementDAO;
