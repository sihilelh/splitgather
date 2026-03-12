import { db } from '../db/index.js';
import { records, users, groups, recordSplits } from '../db/schema.js';
import { eq, isNull, and } from 'drizzle-orm';

export const recordDAO = {
  /**
   * Create a new expense record
   * @param {Object} recordData - Record data
   * @param {number} [recordData.groupId] - Group ID (null for personal expenses)
   * @param {number} recordData.paidBy - User ID who paid
   * @param {string} recordData.description - Expense description
   * @param {number} recordData.amount - Expense amount
   * @returns {Promise<Object>} Created record
   */
  async create(recordData) {
    const result = await db.insert(records).values(recordData).returning();
    return result[0];
  },

  /**
   * Find record by ID
   * @param {number} id - Record ID
   * @returns {Promise<Object|null>} Record or null if not found
   */
  async findById(id) {
    const result = await db.select().from(records).where(eq(records.id, id)).limit(1);
    return result[0] || null;
  },

  /**
   * Get record with payer details
   * @param {number} id - Record ID
   * @returns {Promise<Object|null>} Record with payer or null if not found
   */
  async findByIdWithPayer(id) {
    const result = await db
      .select({
        id: records.id,
        groupId: records.groupId,
        paidBy: records.paidBy,
        description: records.description,
        amount: records.amount,
        createdAt: records.createdAt,
        payer: users,
      })
      .from(records)
      .innerJoin(users, eq(records.paidBy, users.id))
      .where(eq(records.id, id))
      .limit(1);
    return result[0] || null;
  },

  /**
   * Get all records
   * @returns {Promise<Array>} Array of records
   */
  async findAll() {
    return await db.select().from(records);
  },

  /**
   * Get records by group ID
   * @param {number} groupId - Group ID
   * @returns {Promise<Array>} Array of records
   */
  async getRecordsByGroupId(groupId) {
    return await db
      .select({
        id: records.id,
        groupId: records.groupId,
        paidBy: records.paidBy,
        description: records.description,
        amount: records.amount,
        createdAt: records.createdAt,
        payer: users,
      })
      .from(records)
      .innerJoin(users, eq(records.paidBy, users.id))
      .where(eq(records.groupId, groupId));
  },

  /**
   * Get personal records (not in a group) for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of personal records
   */
  async getPersonalRecordsByUserId(userId) {
    return await db
      .select({
        id: records.id,
        groupId: records.groupId,
        paidBy: records.paidBy,
        description: records.description,
        amount: records.amount,
        createdAt: records.createdAt,
        payer: users,
      })
      .from(records)
      .innerJoin(users, eq(records.paidBy, users.id))
      .where(and(eq(records.paidBy, userId), isNull(records.groupId)));
  },

  /**
   * Get records paid by a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of records
   */
  async getRecordsByPayer(userId) {
    return await db.select().from(records).where(eq(records.paidBy, userId));
  },

  /**
   * Get records with splits
   * @param {number} id - Record ID
   * @returns {Promise<Object|null>} Record with splits or null if not found
   */
  async getRecordWithSplits(id) {
    const record = await this.findByIdWithPayer(id);
    if (!record) return null;

    const splits = await db
      .select({
        id: recordSplits.id,
        recordId: recordSplits.recordId,
        userId: recordSplits.userId,
        amount: recordSplits.amount,
        user: users,
      })
      .from(recordSplits)
      .innerJoin(users, eq(recordSplits.userId, users.id))
      .where(eq(recordSplits.recordId, id));

    return { ...record, splits };
  },

  /**
   * Update record
   * @param {number} id - Record ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated record or null if not found
   */
  async update(id, updates) {
    const result = await db
      .update(records)
      .set(updates)
      .where(eq(records.id, id))
      .returning();
    return result[0] || null;
  },

  /**
   * Delete record
   * @param {number} id - Record ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const result = await db.delete(records).where(eq(records.id, id)).returning();
    return result.length > 0;
  },
};

export default recordDAO;
