import * as friendService from '../services/friendService.js';

/**
 * Search users by name or email
 * GET /api/friends/search?q=query
 */
export async function searchUsers(req, res) {
  try {
    const { q: query } = req.query;
    const { id: userId } = req.user;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const results = await friendService.searchUsers(query, userId);

    res.status(200).json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to search users',
    });
  }
}

/**
 * Get friends list with balances
 * GET /api/friends
 */
export async function getFriends(req, res) {
  try {
    const { id: userId } = req.user;

    const friendsData = await friendService.getFriends(userId);

    res.status(200).json({
      success: true,
      ...friendsData,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to get friends',
    });
  }
}

/**
 * Add a friend
 * POST /api/friends
 * Body: { friendId: number }
 */
export async function addFriend(req, res) {
  try {
    const { id: userId } = req.user;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({
        success: false,
        message: 'friendId is required',
      });
    }

    const friendRecord = await friendService.addFriend(userId, friendId);

    res.status(201).json({
      success: true,
      friend: friendRecord,
      message: 'Friend added successfully',
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to add friend',
    });
  }
}

/**
 * Get friend balances
 * GET /api/friends/balances
 */
export async function getFriendBalances(req, res) {
  try {
    const { id: userId } = req.user;

    const friendsData = await friendService.getFriends(userId);

    // Calculate totals
    const totalOwed = friendsData.oweYou.reduce((sum, f) => sum + Math.abs(f.balance), 0);
    const totalOwe = friendsData.youOwe.reduce((sum, f) => sum + f.balance, 0);
    const netBalance = totalOwed - totalOwe;

    res.status(200).json({
      success: true,
      totalOwed,
      totalOwe,
      netBalance,
      friends: friendsData.all,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Failed to get friend balances',
    });
  }
}
