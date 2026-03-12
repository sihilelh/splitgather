import { db } from '../db/index.js';
import { recordSplits, records, users } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

export const recordSplitDAO = {
  /**
   * Create a new record split
   * @param {Object} splitData - Split data
   * @param {number} splitData.recordId - Record ID
   * @param {number} splitData.userId - User ID
   * @param {number} splitData.amount - Split amount
   * @returns {Promise<Object>} Created split
   */
  async create(splitData) {
    const result = await db.insert(recordSplits).values(splitData).returning();
    return result[0];
  },

  /**
   * Create multiple splits at once
   * @param {Array<Object>} splitsArray - Array of split data objects
   * @returns {Promise<Array>} Array of created splits
   */
  async createMany(splitsArray) {
    const result = await db.insert(recordSplits).values(splitsArray).returning();
    return result;
  },

  /**
   * Find split by ID
   * @param {number} id - Split ID
   * @returns {Promise<Object|null>} Split or null if not found
   */
  async findById(id) {
    const result = await db.select().from(recordSplits).where(eq(recordSplits.id, id)).limit(1);
    return result[0] || null;
  },

  /**
   * Get all splits for a record
   * @param {number} recordId - Record ID
   * @returns {Promise<Array>} Array of splits with user details
   */
  async getSplitsByRecordId(recordId) {
    return await db
      .select({
        id: recordSplits.id,
        recordId: recordSplits.recordId,
        userId: recordSplits.userId,
        amount: recordSplits.amount,
        user: users,
      })
      .from(recordSplits)
      .innerJoin(users, eq(recordSplits.userId, users.id))
      .where(eq(recordSplits.recordId, recordId));
  },

  /**
   * Get all splits for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of splits with record details
   */
  async getSplitsByUserId(userId) {
    return await db
      .select({
        id: recordSplits.id,
        recordId: recordSplits.recordId,
        userId: recordSplits.userId,
        amount: recordSplits.amount,
        record: records,
      })
      .from(recordSplits)
      .innerJoin(records, eq(recordSplits.recordId, records.id))
      .where(eq(recordSplits.userId, userId));
  },

  /**
   * Find split by record and user
   * @param {number} recordId - Record ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} Split or null if not found
   */
  async findByRecordAndUser(recordId, userId) {
    const result = await db
      .select()
      .from(recordSplits)
      .where(and(eq(recordSplits.recordId, recordId), eq(recordSplits.userId, userId)))
      .limit(1);
    return result[0] || null;
  },

  /**
   * Update split
   * @param {number} id - Split ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated split or null if not found
   */
  async update(id, updates) {
    const result = await db
      .update(recordSplits)
      .set(updates)
      .where(eq(recordSplits.id, id))
      .returning();
    return result[0] || null;
  },

  /**
   * Delete split
   * @param {number} id - Split ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const result = await db.delete(recordSplits).where(eq(recordSplits.id, id)).returning();
    return result.length > 0;
  },

  /**
   * Delete all splits for a record
   * @param {number} recordId - Record ID
   * @returns {Promise<number>} Number of deleted splits
   */
  async deleteByRecordId(recordId) {
    const result = await db
      .delete(recordSplits)
      .where(eq(recordSplits.recordId, recordId))
      .returning();
    return result.length;
  },
};

export default recordSplitDAO;
