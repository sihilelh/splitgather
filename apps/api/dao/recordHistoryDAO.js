import { db } from '../db/index.js';
import { recordHistory, records, users } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';

export const recordHistoryDAO = {
  /**
   * Create a new history entry
   * @param {Object} historyData - History data
   * @param {number} historyData.recordId - Record ID
   * @param {string} historyData.action - Action type ('created', 'updated', 'deleted')
   * @param {number} historyData.changedBy - User ID who made the change
   * @param {Object} [historyData.oldData] - Previous state (will be stringified)
   * @param {Object} [historyData.newData] - New state (will be stringified)
   * @returns {Promise<Object>} Created history entry
   */
  async create(historyData) {
    const data = {
      ...historyData,
      oldData: historyData.oldData ? JSON.stringify(historyData.oldData) : null,
      newData: historyData.newData ? JSON.stringify(historyData.newData) : null,
    };
    const result = await db.insert(recordHistory).values(data).returning();
    return result[0];
  },

  /**
   * Get history for a record
   * @param {number} recordId - Record ID
   * @returns {Promise<Array>} Array of history entries
   */
  async getHistoryByRecordId(recordId) {
    const results = await db
      .select({
        id: recordHistory.id,
        recordId: recordHistory.recordId,
        action: recordHistory.action,
        changedBy: recordHistory.changedBy,
        oldData: recordHistory.oldData,
        newData: recordHistory.newData,
        createdAt: recordHistory.createdAt,
        changedByUser: users,
      })
      .from(recordHistory)
      .innerJoin(users, eq(recordHistory.changedBy, users.id))
      .where(eq(recordHistory.recordId, recordId))
      .orderBy(desc(recordHistory.createdAt));

    // Parse JSON data
    return results.map(entry => ({
      ...entry,
      oldData: entry.oldData ? JSON.parse(entry.oldData) : null,
      newData: entry.newData ? JSON.parse(entry.newData) : null,
    }));
  },

  /**
   * Get history entry by ID
   * @param {number} id - History entry ID
   * @returns {Promise<Object|null>} History entry or null if not found
   */
  async findById(id) {
    const result = await db.select().from(recordHistory).where(eq(recordHistory.id, id)).limit(1);
    if (result.length === 0) return null;

    const entry = result[0];
    return {
      ...entry,
      oldData: entry.oldData ? JSON.parse(entry.oldData) : null,
      newData: entry.newData ? JSON.parse(entry.newData) : null,
    };
  },

  /**
   * Get all history entries for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of history entries
   */
  async getHistoryByUser(userId) {
    const results = await db
      .select({
        id: recordHistory.id,
        recordId: recordHistory.recordId,
        action: recordHistory.action,
        changedBy: recordHistory.changedBy,
        oldData: recordHistory.oldData,
        newData: recordHistory.newData,
        createdAt: recordHistory.createdAt,
        record: records,
      })
      .from(recordHistory)
      .innerJoin(records, eq(recordHistory.recordId, records.id))
      .where(eq(recordHistory.changedBy, userId))
      .orderBy(desc(recordHistory.createdAt));

    // Parse JSON data
    return results.map(entry => ({
      ...entry,
      oldData: entry.oldData ? JSON.parse(entry.oldData) : null,
      newData: entry.newData ? JSON.parse(entry.newData) : null,
    }));
  },
};

export default recordHistoryDAO;
