import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Friends table
export const friends = sqliteTable('friends', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userAId: integer('user_a_id').notNull().references(() => users.id),
  userBId: integer('user_b_id').notNull().references(() => users.id),
  userAowsB: real('user_a_ows_b').notNull().default(0.0), // Positive = userA owes userB, Negative = userB owes userA
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Groups table
export const groups = sqliteTable('groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  createdBy: integer('created_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Group participants table
export const groupParticipants = sqliteTable('group_participants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id').notNull().references(() => groups.id),
  userId: integer('user_id').notNull().references(() => users.id),
  owsAmount: real('ows_amount').notNull().default(0.0),
  joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Records table
export const records = sqliteTable('records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id').references(() => groups.id), // nullable for personal expenses
  paidBy: integer('paid_by').notNull().references(() => users.id),
  description: text('description').notNull(),
  amount: real('amount').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Record splits table
export const recordSplits = sqliteTable('record_splits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  recordId: integer('record_id').notNull().references(() => records.id),
  userId: integer('user_id').notNull().references(() => users.id),
  amount: real('amount').notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  friendsAsUserA: many(friends, { relationName: 'userA' }),
  friendsAsUserB: many(friends, { relationName: 'userB' }),
  createdGroups: many(groups),
  groupParticipants: many(groupParticipants),
  paidRecords: many(records),
  recordSplits: many(recordSplits),
}));

export const friendsRelations = relations(friends, ({ one }) => ({
  userA: one(users, {
    fields: [friends.userAId],
    references: [users.id],
    relationName: 'userA',
  }),
  userB: one(users, {
    fields: [friends.userBId],
    references: [users.id],
    relationName: 'userB',
  }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
  participants: many(groupParticipants),
  records: many(records),
}));

export const groupParticipantsRelations = relations(groupParticipants, ({ one }) => ({
  group: one(groups, {
    fields: [groupParticipants.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupParticipants.userId],
    references: [users.id],
  }),
}));

export const recordsRelations = relations(records, ({ one, many }) => ({
  group: one(groups, {
    fields: [records.groupId],
    references: [groups.id],
  }),
  payer: one(users, {
    fields: [records.paidBy],
    references: [users.id],
  }),
  splits: many(recordSplits),
}));

export const recordSplitsRelations = relations(recordSplits, ({ one }) => ({
  record: one(records, {
    fields: [recordSplits.recordId],
    references: [records.id],
  }),
  user: one(users, {
    fields: [recordSplits.userId],
    references: [users.id],
  }),
}));
