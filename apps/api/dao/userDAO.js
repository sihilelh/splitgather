import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export const userDAO = {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.name - User name
   * @param {string} userData.email - User email
   * @param {string} userData.passwordHash - Hashed password
   * @returns {Promise<Object>} Created user
   */
  async create(userData) {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  },

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User or null if not found
   */
  async findById(id) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  },

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User or null if not found
   */
  async findByEmail(email) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  },

  /**
   * Get all users
   * @returns {Promise<Array>} Array of users
   */
  async findAll() {
    return await db.select().from(users);
  },

  /**
   * Update user by ID
   * @param {number} id - User ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated user or null if not found
   */
  async update(id, updates) {
    const result = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  },

  /**
   * Delete user by ID
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async delete(id) {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  },
};

export default userDAO;
