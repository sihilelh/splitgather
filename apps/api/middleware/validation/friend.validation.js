/**
 * Validation middleware for friend-related routes
 */

/**
 * Validate add friend request
 * Checks that friendId is present and is a valid number
 */
export function validateAddFriend(req, res, next) {
  const { friendId } = req.body;

  if (friendId === undefined || friendId === null) {
    return res.status(400).json({
      success: false,
      message: 'friendId is required',
    });
  }

  const friendIdNum = Number(friendId);
  if (isNaN(friendIdNum) || !Number.isInteger(friendIdNum) || friendIdNum <= 0) {
    return res.status(400).json({
      success: false,
      message: 'friendId must be a positive integer',
    });
  }

  // Attach validated friendId to request body
  req.body.friendId = friendIdNum;
  next();
}
