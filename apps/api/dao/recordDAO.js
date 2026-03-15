import { db } from '../db/index.js';
import { records, users, groups, recordSplits } from '../db/schema.js';
import { eq, isNull, and, inArray } from 'drizzle-orm';

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
    console.log('[getRecordsByGroupId DAO] Fetching records for groupId:', groupId);
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
      .where(eq(records.groupId, groupId));
    console.log('[getRecordsByGroupId DAO] Found records:', result?.length || 0);
    if (result?.length > 0) {
      console.log('[getRecordsByGroupId DAO] Sample record:', {
        id: result[0].id,
        groupId: result[0].groupId,
        paidBy: result[0].paidBy,
        description: result[0].description,
      });
    }
    return result;
  },

  /**
   * Get personal records (not in a group) for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of personal records
   */
  async getPersonalRecordsByUserId(userId) {
    console.log('[getPersonalRecordsByUserId DAO] Fetching personal records for userId:', userId);
    
    // First, let's check all records to see what exists
    const allRecords = await db.select().from(records).limit(10);
    console.log('[getPersonalRecordsByUserId DAO] Sample of all records in DB:', {
      total: allRecords.length,
      records: allRecords.map(r => ({
        id: r.id,
        groupId: r.groupId,
        paidBy: r.paidBy,
        description: r.description,
      })),
    });
    
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
      .where(and(eq(records.paidBy, userId), isNull(records.groupId)));
    
    console.log('[getPersonalRecordsByUserId DAO] Found personal records:', result?.length || 0);
    if (result?.length > 0) {
      console.log('[getPersonalRecordsByUserId DAO] Sample personal record:', {
        id: result[0].id,
        groupId: result[0].groupId,
        paidBy: result[0].paidBy,
        description: result[0].description,
      });
    } else {
      console.log('[getPersonalRecordsByUserId DAO] No personal records found. Query conditions: paidBy =', userId, 'AND groupId IS NULL');
    }
    
    return result;
  },

  /**
   * Get records paid by a user (with payer details)
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of records with payer details
   */
  async getRecordsByPayer(userId) {
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
      .where(eq(records.paidBy, userId));
  },

  /**
   * Get records where user is a participant (via splits)
   * @param {number} userId - User ID
   * @param {Array<number>} excludeRecordIds - Record IDs to exclude (e.g., already fetched as payer)
   * @returns {Promise<Array>} Array of records where user is a participant
   */
  async getRecordsByParticipant(userId, excludeRecordIds = []) {
    console.log('[getRecordsByParticipant DAO] Fetching records where userId is participant:', userId);
    console.log('[getRecordsByParticipant DAO] Excluding record IDs:', excludeRecordIds);
    
    // Get record IDs where user is a participant via splits
    const userSplits = await db
      .select({ recordId: recordSplits.recordId })
      .from(recordSplits)
      .where(eq(recordSplits.userId, userId));
    
    const participantRecordIds = userSplits
      .map(s => s.recordId)
      .filter(id => !excludeRecordIds.includes(id));
    
    console.log('[getRecordsByParticipant DAO] Found', participantRecordIds.length, 'record IDs where user is participant');
    
    if (participantRecordIds.length === 0) {
      return [];
    }
    
    // Get records with payer details using IN clause
    const allResults = await db
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
      .where(inArray(records.id, participantRecordIds));
    
    console.log('[getRecordsByParticipant DAO] Found', allResults.length, 'records where user is participant');
    
    return allResults;
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
