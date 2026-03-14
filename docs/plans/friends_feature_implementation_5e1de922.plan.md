---
name: Friends Feature Implementation
overview: Implement a complete friends feature with backend API endpoints, database schema updates, and frontend integration. This includes user search, friend management, and balance tracking.
todos: []
---

# Friends Feature Implementation Plan

## Overview

This plan implements a complete friends feature including backend API endpoints, database schema updates, and frontend integration with search, friend management, and balance tracking.

## Database Schema Updates

### 1. Update Friends Table Schema

- **File**: `apps/api/db/schema.js`
- Replace `userId` and `friendId` with `userAId` and `userBId` (where `userAId < userBId` always)
- Add `userAowsB` (real) column - single source of truth for balance
  - Positive value = userA owes userB
  - Negative value = userB owes userA (userA is owed)
- Remove `status` column (no friend request mechanism - friendships are instant)
- Create a new migration file to restructure the table

### 2. Create Migration

- **File**: `apps/api/db/migrations/XXXX_restructure_friends_table.sql` (new file)
- **Migration Strategy**:

  1. Create new table structure with normalized columns
  2. Migrate existing data: For each `(userId, friendId)` record:

     - Normalize: `userAId = min(userId, friendId)`, `userBId = max(userId, friendId)`
     - If duplicate exists (same normalized pair), merge or skip
     - Set `userAowsB = 0.0` (balances will be recalculated from records later)

  1. Drop old table and rename new table

- Schema changes:
  - Rename `user_id` to `user_a_id` and `friend_id` to `user_b_id`
  - Add `user_a_ows_b` column (real, default 0.0, not null)
  - Add unique constraint on `(user_a_id, user_b_id)` to prevent duplicates
  - Add CHECK constraint: `user_a_id < user_b_id` (enforced at database level)
  - Remove `status` column (no friend request mechanism - friendships are instant)

## Backend Implementation

### 3. Update FriendDAO

- **File**: `apps/api/dao/friendDAO.js`
- Remove `getFriendRequests()` method (no friend request mechanism)
- Add helper function `normalizeUserIds(userId1, userId2)` - Returns `[userAId, userBId]` where `userAId < userBId`
- Update/Add methods:
  - `searchUsers(query, currentUserId, limit)` - Search users by name or email, exclude current user and existing friends, return max 10 results alphabetically
  - `getFriendsWithBalances(userId)` - Get all friends with perspective-adjusted balances
    - Query: `WHERE userAId = userId OR userBId = userId`
    - For each record, calculate balance from current user's perspective:
      - If `userAId = userId`: balance = `userAowsB` (positive = owes, negative = is owed)
      - If `userBId = userId`: balance = `-userAowsB` (flipped perspective)
  - `create(userId1, userId2)` - Create single friend record with normalized IDs
    - Normalize IDs: `[userAId, userBId] = normalizeUserIds(userId1, userId2)`
    - Insert: `(userAId, userBId, userAowsB: 0.0)`
    - Check for existing record to prevent duplicates
  - `findByUsers(userId1, userId2)` - Find friend record using normalized IDs
  - `updateBalance(userId1, userId2, amountDelta)` - Update balance
    - Normalize IDs to find record
    - If `userAId = userId1`: `userAowsB += amountDelta`
    - If `userBId = userId1`: `userAowsB -= amountDelta` (flip the delta)

### 4. Create FriendService

- **File**: `apps/api/services/friendService.js` (new file)
- Business logic layer:
  - `searchUsers(query, userId)` - Search users with validation
  - `getFriends(userId)` - Get friends list with perspective-adjusted balances, categorized
    - Transform friend records to include friend user info and calculated balance
    - Balance calculation helper: `getBalanceForUser(friendRecord, currentUserId)`
  - `addFriend(userId, friendId)` - Add friend relationship instantly (single record with normalized IDs)
    - Validate users exist and are different
    - Check if friendship already exists (return existing if found)
    - Create single record with normalized ordering immediately (no approval needed)
  - `updateFriendBalance(userId, friendId, amountDelta)` - Update balance from user's perspective
    - Normalize IDs and find record
    - Apply delta with correct sign based on user's position (userA or userB)

### 5. Create FriendController

- **File**: `apps/api/controllers/friendController.js` (new file)
- Request handlers:
  - `searchUsers(req, res)` - GET `/api/friends/search?q=query`
  - `getFriends(req, res)` - GET `/api/friends`
  - `addFriend(req, res)` - POST `/api/friends` with `{ friendId }`
  - `getFriendBalances(req, res)` - GET `/api/friends/balances`

### 6. Create Friend Routes

- **File**: `apps/api/routes/friendRoutes.js` (new file)
- Routes:
  - `GET /api/friends/search?q=query` - Search users (authenticated)
  - `GET /api/friends` - Get friends list (authenticated)
  - `POST /api/friends` - Add friend (authenticated)
  - `GET /api/friends/balances` - Get friend balances (authenticated)

### 7. Update Main Router

- **File**: `apps/api/routes/routes.js`
- Add `friendRouter` import and mount at `/friends`

### 8. Create Validation Middleware

- **File**: `apps/api/middleware/validation/friend.validation.js` (new file)
- Validators:
  - `validateAddFriend` - Validate friendId is present and is a number

## Frontend Implementation

### 9. Create Friends API Service

- **File**: `apps/web/src/api/friendService.js` (new file)
- API client functions:
  - `searchUsers(query)` - Search users by name/email
  - `getFriends()` - Get friends list
  - `addFriend(friendId)` - Add a friend instantly (no approval needed)
  - `getFriendBalances()` - Get friend balances

### 10. Create useFriends Hook

- **File**: `apps/web/src/hooks/useFriends.jsx` (new file)
- Custom hook providing:
  - `friends` - Friends list state
  - `loading` - Loading state
  - `error` - Error state
  - `searchUsers(query)` - Search function
  - `addFriend(friendId)` - Add friend function (instant, no approval)
  - `refreshFriends()` - Refresh friends list
  - `getFriendsByCategory()` - Get categorized friends (oweYou, youOwe, settled)

### 11. Update FriendsScreen Component

- **File**: `apps/web/src/screens/FriendsScreen.jsx`
- Replace mock data with `useFriends` hook
- Update search functionality to use real API
- Implement alphabetical ordering and "Show More" button (max 10 results initially)
- Sort friends by balance in descending order within categories
- Update "+Add" button popup to:
  - Search registered users (not mock data)
  - Display results alphabetically (max 10, with show more)
  - Call API to add friend
- Update friend list display to show "You Owe" and "Owe You" categories sorted by amount descending

### 12. Update App.jsx

- **File**: `apps/web/src/App.jsx`
- Replace `useStore` friends with `useFriends` hook
- Update FriendsScreen props to use hook data

## Data Flow

```
Frontend (FriendsScreen)
  ↓ useFriends hook
  ↓ friendService API calls
Backend Routes (/api/friends)
  ↓ friendController
  ↓ friendService
  ↓ friendDAO
Database (friends table with userAId, userBId, userAowsB)
```

## Key Implementation Details

1. **Single Record Friendship Model**: When A adds B as friend, create ONE record:

   - Normalize IDs: `userAId = min(A, B)`, `userBId = max(A, B)`
   - Create: `(userAId, userBId, userAowsB: 0.0)`
   - Both users query the same record but see different perspectives

2. **Perspective-Based Balance Calculation**:

   - Helper function: `getBalanceForUser(friendRecord, currentUserId)`
   - If `friendRecord.userAId === currentUserId`:
     - Balance = `friendRecord.userAowsB`
     - Positive = current user owes friend
     - Negative = friend owes current user
   - If `friendRecord.userBId === currentUserId`:
     - Balance = `-friendRecord.userAowsB` (flip sign)
     - Positive = friend owes current user
     - Negative = current user owes friend

3. **Search Constraints**:

   - Search by name (case-insensitive partial match) or email (exact/partial match)
   - Exclude current user from results
   - Exclude already-friended users (check both userAId and userBId positions)
   - Return max 10 results alphabetically by name
   - Show "Show More" button if more than 10 results

4. **Balance Updates**:

   - When updating balance, normalize user IDs first
   - If updating user is `userAId`: `userAowsB += delta`
   - If updating user is `userBId`: `userAowsB -= delta` (flip delta)
   - Example: A (userAId=1) pays $10 for B (userBId=2)
     - Record: `(userAId=1, userBId=2, userAowsB=-10)`
     - A sees: balance = -10 (B owes A $10) ✓
     - B sees: balance = -(-10) = 10 (B owes A $10) ✓

5. **Categorization**:

   - "Owe You": `balance < 0` (friend owes you), sorted by absolute value descending
     - Example: balance = -50 means friend owes you $50
   - "You Owe": `balance > 0` (you owe friend), sorted descending
     - Example: balance = 30 means you owe friend $30
   - "Settled": `balance === 0`

6. **Instant Friend Addition**:

   - When a user adds another user as a friend, the friendship is created immediately
   - No approval or request mechanism - both users become friends instantly
   - If friendship already exists, return existing record (idempotent operation)

## Testing Considerations

- Test user search with various queries
- Test adding friends (single record creation with normalized IDs)
- Test ID normalization (ensure userAId < userBId always)
- Test perspective-based balance calculations (both userA and userB views)
- Test balance updates from both user positions
- Test friend categorization and sorting
- Test error handling (duplicate friends, invalid user IDs, self-friending)
- Test edge cases (users with same ID, negative balances, zero balances)