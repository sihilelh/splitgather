import { db } from '../db/index.js';
import { friends, users } from '../db/schema.js';
import { eq, and, or, like, notInArray, ne } from 'drizzle-orm';

/**
 * Helper function to normalize user IDs
 * Ensures userAId < userBId always
 * @param {number} userId1 - First user ID
 * @param {number} userId2 - Second user ID
 * @returns {Array<number>} [userAId, userBId] where userAId < userBId
 */
function normalizeUserIds(userId1, userId2) {
  return userId1 < userId2 ? [userId1, userId2] : [userId2, userId1];
}

export const friendDAO = {
  /**
   * Search users by name or email
   * @param {string} query - Search query (name or email)
   * @param {number} currentUserId - Current user ID to exclude from results
   * @param {number} limit - Maximum number of results (default 10)
   * @returns {Promise<Array>} Array of users matching the query
   */
  async searchUsers(query, currentUserId, limit = 10) {
    const searchPattern = `%${query}%`;
    
    // Get all friend relationships for current user (both as userA and userB)
    const userFriendsAsA = await db
      .select({ friendId: friends.userBId })
      .from(friends)
      .where(eq(friends.userAId, currentUserId));
    
    const userFriendsAsB = await db
      .select({ friendId: friends.userAId })
      .from(friends)
      .where(eq(friends.userBId, currentUserId));

    // Combine friend IDs from both directions
    const friendIds = [
      ...userFriendsAsA.map(f => f.friendId),
      ...userFriendsAsB.map(f => f.friendId),
    ];

    // Build query conditions
    const conditions = [
      ne(users.id, currentUserId),
      or(
        like(users.name, searchPattern),
        like(users.email, searchPattern)
      )
    ];
    
    // Exclude existing friends (only add condition if there are friends to exclude)
    if (friendIds.length > 0) {
      conditions.push(notInArray(users.id, friendIds));
    }
    
    // Search users by name or email, exclude current user and existing friends
    const results = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(...conditions))
      .orderBy(users.name)
      .limit(limit);
    
    return results;
  },

  /**
   * Search existing friends by name or email (for group creation)
   * @param {string} query - Search query (name or email)
   * @param {number} currentUserId - Current user ID
   * @param {number} limit - Maximum number of results (default 10)
   * @returns {Promise<Array>} Array of friends matching the query
   */
  async searchFriends(query, currentUserId, limit = 10) {
    const searchPattern = `%${query}%`;
    
    // Get friends where user is userA (friend is userB)
    const userFriendsAsA = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(friends)
      .innerJoin(users, eq(friends.userBId, users.id))
      .where(
        and(
          eq(friends.userAId, currentUserId),
          or(
            like(users.name, searchPattern),
            like(users.email, searchPattern)
          )
        )
      );
    
    // Get friends where user is userB (friend is userA)
    const userFriendsAsB = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(friends)
      .innerJoin(users, eq(friends.userAId, users.id))
      .where(
        and(
          eq(friends.userBId, currentUserId),
          or(
            like(users.name, searchPattern),
            like(users.email, searchPattern)
          )
        )
      );

    // Combine and deduplicate (in case of any edge cases)
    const allFriends = [...userFriendsAsA, ...userFriendsAsB];
    const uniqueFriends = Array.from(
      new Map(allFriends.map(f => [f.id, f])).values()
    );

    // Sort and limit
    const sorted = uniqueFriends
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, limit);

    return sorted;
  },

  /**
   * Get all friends for a user with perspective-adjusted balances
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of friend relationships with friend user info and balance
   */
  async getFriendsWithBalances(userId) {
    // Get friends where user is userA
    const friendsAsA = await db
      .select({
        id: friends.id,
        userAId: friends.userAId,
        userBId: friends.userBId,
        userAowsB: friends.userAowsB,
        createdAt: friends.createdAt,
        friend: users,
      })
      .from(friends)
      .innerJoin(users, eq(friends.userBId, users.id))
      .where(eq(friends.userAId, userId));

    // Get friends where user is userB
    const friendsAsB = await db
      .select({
        id: friends.id,
        userAId: friends.userAId,
        userBId: friends.userBId,
        userAowsB: friends.userAowsB,
        createdAt: friends.createdAt,
        friend: users,
      })
      .from(friends)
      .innerJoin(users, eq(friends.userAId, users.id))
      .where(eq(friends.userBId, userId));

    // Combine and transform with perspective-adjusted balances
    const allFriends = [
      ...friendsAsA.map(record => ({
        id: record.id,
        friendId: record.friend.id,
        friend: record.friend,
        balance: record.userAowsB, // userA perspective: positive = owes, negative = is owed
        createdAt: record.createdAt,
      })),
      ...friendsAsB.map(record => ({
        id: record.id,
        friendId: record.friend.id,
        friend: record.friend,
        balance: -record.userAowsB, // userB perspective: flip sign
        createdAt: record.createdAt,
      })),
    ];

    return allFriends;
  },

  /**
   * Create a new friend relationship with normalized IDs
   * @param {number} userId1 - First user ID
   * @param {number} userId2 - Second user ID
   * @returns {Promise<Object>} Created friend relationship
   */
  async create(userId1, userId2) {
    const [userAId, userBId] = normalizeUserIds(userId1, userId2);
    
    // Check if friendship already exists
    const existing = await this.findByUsers(userId1, userId2);
    if (existing) {
      return existing;
    }

    const result = await db
      .insert(friends)
      .values({
        userAId,
        userBId,
        userAowsB: 0.0,
      })
      .returning();
    
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
   * Find friend relationship between two users using normalized IDs
   * @param {number} userId1 - First user ID
   * @param {number} userId2 - Second user ID
   * @returns {Promise<Object|null>} Friend relationship or null if not found
   */
  async findByUsers(userId1, userId2) {
    const [userAId, userBId] = normalizeUserIds(userId1, userId2);
    
    const result = await db
      .select()
      .from(friends)
      .where(
        and(
          eq(friends.userAId, userAId),
          eq(friends.userBId, userBId)
        )
      )
      .limit(1);
    
    return result[0] || null;
  },

  /**
   * Update balance between two users
   * @param {number} userId1 - First user ID (the one updating)
   * @param {number} userId2 - Second user ID
   * @param {number} amountDelta - Amount to add/subtract from balance
   * @returns {Promise<Object|null>} Updated friend relationship or null if not found
   */
  async updateBalance(userId1, userId2, amountDelta) {
    const [userAId, userBId] = normalizeUserIds(userId1, userId2);
    
    // Find the record
    const record = await this.findByUsers(userId1, userId2);
    if (!record) {
      return null;
    }

    // Determine the sign of delta based on which user is updating
    let delta;
    if (record.userAId === userId1) {
      delta = amountDelta; // userA updating: add to userAowsB
    } else {
      delta = -amountDelta; // userB updating: subtract from userAowsB (flip sign)
    }

    // Calculate new balance
    const newBalance = record.userAowsB + delta;

    const result = await db
      .update(friends)
      .set({
        userAowsB: newBalance,
      })
      .where(eq(friends.id, record.id))
      .returning();
    
    return result[0] || null;
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
