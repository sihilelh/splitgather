# API Documentation

## Overview

This document describes the API endpoints for the FairShare expense sharing application, specifically covering the Records and Settlements functionality.

**Base URL:** `http://localhost:4000/api`

**Authentication:** All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Records API

Records represent expense transactions where one user pays for an expense that is split among multiple participants.

### Create Record

Create a new expense record with splits.

**Endpoint:** `POST /api/records`

**Request Body:**
```json
{
  "description": "Pizza Night",
  "amount": 5000.00,
  "paidBy": 1,
  "participantIds": [2, 3],
  "splitMode": "equal",
  "splitData": {},
  "groupId": 1,
  "category": "food",
  "expenseDate": "2024-01-15T00:00:00.000Z"
}
```

**Fields:**
- `description` (string, required): Expense description
- `amount` (number, required): Total expense amount (must be > 0)
- `paidBy` (number, required): User ID who paid for the expense
- `participantIds` (array of numbers, required): Array of user IDs involved (excluding payer)
- `splitMode` (string, required): One of `"equal"`, `"percentage"`, or `"custom"`
- `splitData` (object, optional): 
  - For `"percentage"`: `{ userId: percentage }` (e.g., `{ 1: 50, 2: 30, 3: 20 }`)
  - For `"custom"`: `{ userId: amount }` (e.g., `{ 1: 2000, 2: 1500, 3: 1500 }`)
  - For `"equal"`: Can be empty object
- `groupId` (number, optional): Group ID if expense belongs to a group
- `category` (string, optional): Expense category (e.g., "food", "travel", "utilities")
- `expenseDate` (string, optional): ISO date string for the expense date

**Response (201 Created):**
```json
{
  "success": true,
  "record": {
    "id": 1,
    "groupId": 1,
    "paidBy": 1,
    "description": "Pizza Night",
    "amount": 5000.00,
    "category": "food",
    "expenseDate": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "payer": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "splits": [
      {
        "id": 1,
        "recordId": 1,
        "userId": 2,
        "amount": 1666.67,
        "user": {
          "id": 2,
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      },
      {
        "id": 2,
        "recordId": 1,
        "userId": 3,
        "amount": 1666.67,
        "user": {
          "id": 3,
          "name": "Bob Johnson",
          "email": "bob@example.com"
        }
      }
    ]
  },
  "message": "Record created successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input (missing required fields, invalid split mode, etc.)
- `404 Not Found`: Payer or participant not found
- `500 Internal Server Error`: Server error

---

### Get Record by ID

Retrieve a specific record with all details.

**Endpoint:** `GET /api/records/:id`

**Parameters:**
- `id` (number, required): Record ID

**Response (200 OK):**
```json
{
  "success": true,
  "record": {
    "id": 1,
    "groupId": 1,
    "paidBy": 1,
    "description": "Pizza Night",
    "amount": 5000.00,
    "category": "food",
    "expenseDate": "2024-01-15T00:00:00.000Z",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "payer": { ... },
    "splits": [ ... ]
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid record ID
- `404 Not Found`: Record not found
- `500 Internal Server Error`: Server error

---

### Update Record

Update an existing record. This will reverse old balances and apply new balances.

**Endpoint:** `PUT /api/records/:id`

**Parameters:**
- `id` (number, required): Record ID

**Request Body:**
```json
{
  "description": "Updated Pizza Night",
  "amount": 6000.00,
  "paidBy": 1,
  "participantIds": [2, 3, 4],
  "splitMode": "custom",
  "splitData": {
    "1": 2000,
    "2": 1500,
    "3": 1500,
    "4": 1000
  },
  "category": "food",
  "expenseDate": "2024-01-16T00:00:00.000Z"
}
```

All fields are optional - only include fields you want to update.

**Response (200 OK):**
```json
{
  "success": true,
  "record": { ... },
  "message": "Record updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input
- `404 Not Found`: Record not found
- `500 Internal Server Error`: Server error

---

### Delete Record

Delete a record. This will reverse all balances associated with the record.

**Endpoint:** `DELETE /api/records/:id`

**Parameters:**
- `id` (number, required): Record ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Record deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid record ID
- `404 Not Found`: Record not found
- `500 Internal Server Error`: Server error

---

### List Records

Get records for the current user, optionally filtered by group.

**Endpoint:** `GET /api/records?groupId=1`

**Query Parameters:**
- `groupId` (number, optional): Filter records by group ID

**Response (200 OK):**
```json
{
  "success": true,
  "records": [
    {
      "id": 1,
      "groupId": 1,
      "paidBy": 1,
      "description": "Pizza Night",
      "amount": 5000.00,
      "category": "food",
      "expenseDate": "2024-01-15T00:00:00.000Z",
      "createdAt": "2024-01-20T10:30:00.000Z",
      "payer": { ... }
    },
    ...
  ]
}
```

---

## Settlements API

Settlements represent payments between users to clear outstanding balances from expense records.

### Create Settlement

Create a settlement to clear part or all of a balance between two users.

**Endpoint:** `POST /api/settlements`

**Request Body:**
```json
{
  "payerId": 2,
  "receiverId": 1,
  "amount": 1666.67,
  "groupId": 1,
  "note": "Paid via bank transfer"
}
```

**Fields:**
- `payerId` (number, required): User ID who is paying
- `receiverId` (number, required): User ID who is receiving
- `amount` (number, required): Settlement amount (must be > 0 and <= outstanding balance)
- `groupId` (number, optional): Group ID if settlement is within a group context
- `note` (string, optional): Optional note/description

**Response (201 Created):**
```json
{
  "success": true,
  "settlement": {
    "id": 1,
    "payerId": 2,
    "receiverId": 1,
    "amount": 1666.67,
    "groupId": 1,
    "note": "Paid via bank transfer",
    "createdBy": 2,
    "createdAt": "2024-01-20T11:00:00.000Z",
    "payer": {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "receiver": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "message": "Settlement created successfully"
}
```

**Error Responses:**
- `400 Bad Request`: 
  - Invalid input
  - Payer and receiver cannot be the same
  - Amount exceeds outstanding balance
  - Amount must be greater than zero
- `404 Not Found`: 
  - Payer or receiver not found
  - Friendship not found
  - Group not found (if groupId provided)
- `500 Internal Server Error`: Server error

---

### Get Settlement by ID

Retrieve a specific settlement.

**Endpoint:** `GET /api/settlements/:id`

**Parameters:**
- `id` (number, required): Settlement ID

**Response (200 OK):**
```json
{
  "success": true,
  "settlement": {
    "id": 1,
    "payerId": 2,
    "receiverId": 1,
    "amount": 1666.67,
    "groupId": 1,
    "note": "Paid via bank transfer",
    "createdBy": 2,
    "createdAt": "2024-01-20T11:00:00.000Z",
    "payer": { ... },
    "receiver": { ... }
  }
}
```

---

### Update Settlement

Update a settlement. This will reverse the old settlement effect and apply the new one.

**Endpoint:** `PUT /api/settlements/:id`

**Parameters:**
- `id` (number, required): Settlement ID

**Request Body:**
```json
{
  "amount": 2000.00,
  "note": "Updated payment amount"
}
```

All fields are optional - only include fields you want to update.

**Response (200 OK):**
```json
{
  "success": true,
  "settlement": { ... },
  "message": "Settlement updated successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input or amount exceeds balance
- `404 Not Found`: Settlement not found
- `500 Internal Server Error`: Server error

---

### Delete Settlement

Delete a settlement. This will reverse the settlement effect on balances.

**Endpoint:** `DELETE /api/settlements/:id`

**Parameters:**
- `id` (number, required): Settlement ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Settlement deleted successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid settlement ID
- `404 Not Found`: Settlement not found
- `500 Internal Server Error`: Server error

---

### List Settlements

Get settlements, optionally filtered by user or group.

**Endpoint:** `GET /api/settlements?userId=2&groupId=1`

**Query Parameters:**
- `userId` (number, optional): Get settlements between current user and this user
- `groupId` (number, optional): Get settlements within a group

**Response (200 OK):**
```json
{
  "success": true,
  "settlements": [
    {
      "id": 1,
      "payerId": 2,
      "receiverId": 1,
      "amount": 1666.67,
      "groupId": 1,
      "note": "Paid via bank transfer",
      "createdBy": 2,
      "createdAt": "2024-01-20T11:00:00.000Z",
      "payer": { ... },
      "receiver": { ... }
    },
    ...
  ]
}
```

---

## Data Models

### Record Model

```typescript
interface Record {
  id: number
  groupId: number | null
  paidBy: number
  description: string
  amount: number
  category: string | null
  expenseDate: Date | null
  createdAt: Date
  payer?: User
  splits?: RecordSplit[]
}
```

### RecordSplit Model

```typescript
interface RecordSplit {
  id: number
  recordId: number
  userId: number
  amount: number
  user?: User
}
```

### Settlement Model

```typescript
interface Settlement {
  id: number
  payerId: number
  receiverId: number
  amount: number
  groupId: number | null
  note: string | null
  createdBy: number
  createdAt: Date
  payer?: User
  receiver?: User
}
```

### User Model

```typescript
interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}
```

---

## Balance Calculation Logic

### Friends Table Balance

The `friends` table stores balances using normalized user IDs (userAId < userBId):

- **`userAowsB`** (real): Balance from userA's perspective
  - **Positive value**: userA owes userB
  - **Negative value**: userB owes userA

### Record Impact on Balances

When a record is created:
- If userA pays for userB: `userAowsB` increases (userA is owed money)
- If userB pays for userA: `userAowsB` decreases (userB is owed money)

When a record is updated or deleted:
- Old balances are reversed (subtracted)
- New balances are applied (added)

### Settlement Impact on Balances

When a settlement is created:
- If userA pays userB: `userAowsB` decreases (clears debt)
- If userB pays userA: `userAowsB` increases (clears debt)

When a settlement is updated or deleted:
- Old settlement effect is reversed
- New settlement effect is applied

---

## Split Calculation Methods

### Equal Split

All participants (including payer if included) pay the same amount:
```
perPersonAmount = totalAmount / numParticipants
```

### Percentage Split

Each participant pays a percentage of the total:
```
participantAmount = totalAmount * (participantPercentage / 100)
```

Percentages must sum to 100%.

### Custom Split

Each participant pays a specific amount:
```
participantAmount = customAmount
```

Custom amounts must sum to the total expense amount (within 0.01 rounding tolerance).

### Rounding

Any rounding differences are automatically assigned to the payer to ensure the total always matches the expense amount.

---

## Error Handling

All endpoints return errors in a consistent format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Authentication required or invalid token
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-token>
```

Tokens are obtained through the `/api/auth/login` endpoint and stored in localStorage by the frontend.

---

## Example Workflows

### Creating an Expense Record

1. User creates a record with description, amount, and participants
2. System calculates splits based on split mode
3. System creates record and record splits
4. System updates friend balances for each participant pair
5. System creates history entry
6. Returns created record with splits

### Settling a Balance

1. User selects a friend to settle with
2. User enters settlement amount (full or partial)
3. System validates:
   - Users exist and are friends
   - Amount doesn't exceed balance
   - Amount is positive
4. System creates settlement record
5. System updates friend balance
6. Returns created settlement

### Editing a Record

1. User updates record fields
2. System fetches existing record and splits
3. System reverses old balances
4. System recalculates splits if participants/split mode changed
5. System updates record and splits
6. System applies new balances
7. System creates history entry
8. Returns updated record

---

## Database Schema

### Records Table
- `id`: Primary key
- `group_id`: Foreign key to groups (nullable)
- `paid_by`: Foreign key to users
- `description`: Expense description
- `amount`: Total expense amount
- `category`: Expense category (nullable)
- `expense_date`: Date of expense (nullable)
- `created_at`: Timestamp

### Record Splits Table
- `id`: Primary key
- `record_id`: Foreign key to records
- `user_id`: Foreign key to users
- `amount`: Split amount for this user

### Settlements Table
- `id`: Primary key
- `payer_id`: Foreign key to users
- `receiver_id`: Foreign key to users
- `amount`: Settlement amount
- `group_id`: Foreign key to groups (nullable)
- `note`: Optional note (nullable)
- `created_by`: Foreign key to users
- `created_at`: Timestamp

### Record History Table
- `id`: Primary key
- `record_id`: Foreign key to records
- `action`: 'created', 'updated', or 'deleted'
- `changed_by`: Foreign key to users
- `old_data`: JSON snapshot of previous state (nullable)
- `new_data`: JSON snapshot of new state (nullable)
- `created_at`: Timestamp

---

## Notes

- All monetary amounts are stored as real numbers (floating point)
- Timestamps are stored as integers (Unix timestamps)
- Friend balances are normalized (userAId < userBId) for consistency
- Record history provides full audit trail of all changes
- Settlements never modify original expense records
- Balance calculations are atomic within transactions
