Add Friends Prompt 

Goal: Setting up friends tab, its page, and Adding friends to groups in SplitGather

Context: 
1) There should be a searching tab in the friends page to search registered users.
2) Searching process should be done using either "username" or "email".
3) There should be an "+Add" button to add friends to groups.
4) After clicking or tapping on "+Add" button a tab should pop-up from the below that displays a search bar to search friends and a button to add the chosen friend as "Add Friend".


Constraints: 
1) When click or tap on the searching bar display users in alphabetic order according to their names and only display max of 10 friends when searching and display a show more button if the result is more than 10.
2) Categorize friends list according to "You Owe" and "Owe You".
3) Display friends list on the page under "You Owe", "Owe You" according to the amount remaining in descending order.  
4) Enable to select friends in "+Add" feature.
5) Update the database accordingly while using the "+Add" feature and the "Add Friend".

Architectural Info:
For the `friends` table we only need two user's ids (if A is friend is B, B's friend list also shows A) and we also need two columns for lend amount and owe amount. These values will get updated as the records adding up (which will developed later). You should create seperate routes for seperate concerns and reuse methods as much as possible. You are free to update the drizzel schema and create a new migration. 

For the frontend you should create a useFriends hook to accomadate these backend API endpoints to kick in. The frontend already have a dummy UI that you can take as a base. You should always follow DRY practices

---

## Future Context

This section documents what was implemented in the friends feature to help future AI agents understand the current implementation.

### Database Schema

The `friends` table uses a **single-record model** with normalized IDs:

- **Schema**: `userAId`, `userBId`, `userAowsB` (where `userAId < userBId` always)
- **Normalization**: When A (id=1) adds B (id=2), the record is stored as `(userAId=1, userBId=2, userAowsB=0.0)`
- **Balance Storage**: `userAowsB` is the single source of truth:
  - Positive value = userA owes userB
  - Negative value = userB owes userA (userA is owed)
- **No Status Column**: Friendships are instant (no approval mechanism)
- **Unique Constraint**: `(userAId, userBId)` prevents duplicates

### Backend Implementation

**API Endpoints** (`/api/friends`):
- `GET /api/friends/search?q=query` - Search users by name/email (max 10 results, alphabetical)
- `GET /api/friends` - Get friends list with balances, categorized
- `POST /api/friends` - Add friend instantly (body: `{ friendId }`)
- `GET /api/friends/balances` - Get balance summary (totalOwed, totalOwe, netBalance)

**Key Files**:
- `apps/api/dao/friendDAO.js` - Data access layer with `normalizeUserIds()` helper
- `apps/api/services/friendService.js` - Business logic with `getBalanceForUser()` helper
- `apps/api/controllers/friendController.js` - Request handlers
- `apps/api/routes/friendRoutes.js` - Route definitions
- `apps/api/middleware/validation/friend.validation.js` - Validation middleware

**Balance Calculation**:
- Perspective-based: When user views their friends, balance is calculated from their perspective
- If `userAId === currentUserId`: balance = `userAowsB`
- If `userBId === currentUserId`: balance = `-userAowsB` (flipped)
- Example: Record `(userAId=1, userBId=2, userAowsB=-10)` means:
  - User 1 sees: balance = -10 (User 2 owes User 1 $10)
  - User 2 sees: balance = -(-10) = 10 (User 2 owes User 1 $10)

**Search Implementation**:
- Searches by name (case-insensitive partial match) or email (partial match)
- Excludes current user and existing friends
- Returns max 10 results alphabetically by name
- Frontend shows "Show More" button if more than 10 results

### Frontend Implementation

**Key Files**:
- `apps/web/src/api/friendService.js` - API client functions
- `apps/web/src/hooks/useFriends.jsx` - Custom hook managing friends state
- `apps/web/src/screens/FriendsScreen.jsx` - Main friends screen component

**useFriends Hook**:
- Provides: `friends`, `loading`, `error`, `searchUsers()`, `addFriend()`, `refreshFriends()`, `getFriendsByCategory()`
- Automatically loads friends on mount
- `getFriendsByCategory()` returns: `{ oweYou, youOwe, settled }`

**FriendsScreen Features**:
- Real-time search with debouncing (300ms)
- Displays friends in categories: "Owe You", "You Owe", "Settled"
- Sorted by absolute balance descending within categories
- "+Add" button opens bottom sheet with user search
- Search results show max 10 initially, with "Show More" button
- Friend addition is instant (no approval flow)

**Data Transformation**:
- API returns friends with structure: `{ friendId, friend: { name, email, ... }, balance }`
- Frontend transforms to UI format: `{ id, name, initials, color, balance }`
- Colors are assigned consistently based on user ID modulo

### Migration

**Migration File**: `apps/api/db/migrations/0001_tired_mariko_yashida.sql`
- Transforms old schema (`user_id`, `friend_id`, `status`) to new schema
- Normalizes IDs during migration
- Sets `userAowsB = 0.0` for all migrated records
- Handles duplicates by grouping and taking earliest `created_at`
- Only migrates accepted/pending friendships

### Important Notes

1. **ID Normalization**: Always use `normalizeUserIds(userId1, userId2)` helper to ensure `userAId < userBId`
2. **Balance Updates**: When updating balance, determine sign based on which user is updating (userA or userB)
3. **No Friend Requests**: Friendships are created instantly when one user adds another
4. **Search Limits**: Backend returns max 10 results; frontend can show more with "Show More" button
5. **Categorization**: "Owe You" = negative balance (friend owes you), "You Owe" = positive balance (you owe friend)
6. **Sorting**: Friends sorted by absolute balance descending within each category