import friendDAO from '../dao/friendDAO.js';
import userDAO from '../dao/userDAO.js';

/**
 * Helper function to calculate balance from a user's perspective
 * @param {Object} friendRecord - Friend record from database
 * @param {number} currentUserId - Current user ID
 * @returns {number} Balance from current user's perspective
 */
function getBalanceForUser(friendRecord, currentUserId) {
  if (friendRecord.userAId === currentUserId) {
    return friendRecord.userAowsB; // Positive = current user owes friend, Negative = friend owes current user
  } else {
    return -friendRecord.userAowsB; // Flipped perspective
  }
}

/**
 * Search users by name or email
 * @param {string} query - Search query
 * @param {number} userId - Current user ID
 * @returns {Promise<Array>} Array of users matching the query
 */
export async function searchUsers(query, userId) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const results = await friendDAO.searchUsers(query.trim(), userId, 10);
  return results;
}

/**
 * Get friends list with perspective-adjusted balances, categorized
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Friends list categorized by balance
 */
export async function getFriends(userId) {
  const friendsList = await friendDAO.getFriendsWithBalances(userId);
  
  // Categorize friends
  const oweYou = friendsList
    .filter(f => f.balance < 0) // Friend owes you
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance)); // Sort by absolute value descending
  
  const youOwe = friendsList
    .filter(f => f.balance > 0) // You owe friend
    .sort((a, b) => b.balance - a.balance); // Sort descending
  
  const settled = friendsList.filter(f => f.balance === 0);

  return {
    all: friendsList,
    oweYou,
    youOwe,
    settled,
  };
}

/**
 * Add friend relationship instantly (single record with normalized IDs)
 * @param {number} userId - Current user ID
 * @param {number} friendId - Friend user ID to add
 * @returns {Promise<Object>} Created or existing friend relationship
 * @throws {Error} If users don't exist, are the same, or other validation fails
 */
export async function addFriend(userId, friendId) {
  // Validate users exist and are different
  if (userId === friendId) {
    const error = new Error('Cannot add yourself as a friend');
    error.statusCode = 400;
    throw error;
  }

  const user = await userDAO.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const friendUser = await userDAO.findById(friendId);
  if (!friendUser) {
    const error = new Error('Friend user not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if friendship already exists
  const existing = await friendDAO.findByUsers(userId, friendId);
  if (existing) {
    return existing;
  }

  // Create single record with normalized ordering immediately (no approval needed)
  const friendRecord = await friendDAO.create(userId, friendId);
  return friendRecord;
}

/**
 * Update balance from user's perspective
 * @param {number} userId - User ID (the one updating)
 * @param {number} friendId - Friend user ID
 * @param {number} amountDelta - Amount delta to apply
 * @returns {Promise<Object>} Updated friend relationship
 * @throws {Error} If friendship doesn't exist
 */
export async function updateFriendBalance(userId, friendId, amountDelta) {
  // Normalize IDs and find record
  const record = await friendDAO.findByUsers(userId, friendId);
  if (!record) {
    const error = new Error('Friendship not found');
    error.statusCode = 404;
    throw error;
  }

  // Apply delta with correct sign based on user's position (userA or userB)
  const updated = await friendDAO.updateBalance(userId, friendId, amountDelta);
  return updated;
}
