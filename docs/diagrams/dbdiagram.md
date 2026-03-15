```
Table users {
  id int [pk, increment]
  name varchar
  email varchar [unique]
  password_hash varchar
  created_at timestamp
}

Table friends {
  id int [pk, increment]
  user_id int
  friend_id int
  status varchar  // pending, accepted, blocked
  created_at timestamp
}

Table groups {
  id int [pk, increment]
  name varchar
  description varchar
  created_by int
  created_at timestamp
}

Table group_participants {
  id int [pk, increment]
  group_id int
  user_id int
  joined_at timestamp
}

Table records {
  id int [pk, increment]
  group_id int [null] // null if personal expense
  paid_by int
  description varchar
  amount decimal
  category varchar [null] // expense category (food, travel, utilities, etc.)
  expense_date timestamp [null] // date of expense (separate from created_at)
  created_at timestamp
}

Table record_splits {
  id int [pk, increment]
  record_id int
  user_id int
  amount decimal
}

Table settlements {
  id int [pk, increment]
  payer_id int
  receiver_id int
  amount decimal
  group_id int [null] // optional group context
  note varchar [null] // optional description
  created_by int
  created_at timestamp
}

Table record_history {
  id int [pk, increment]
  record_id int
  action varchar // 'created', 'updated', 'deleted'
  changed_by int
  old_data text [null] // JSON snapshot of previous state
  new_data text [null] // JSON snapshot of new state
  created_at timestamp
}

Ref: friends.user_id > users.id
Ref: friends.friend_id > users.id

Ref: groups.created_by > users.id

Ref: group_participants.group_id > groups.id
Ref: group_participants.user_id > users.id

Ref: records.group_id > groups.id
Ref: records.paid_by > users.id

Ref: record_splits.record_id > records.id
Ref: record_splits.user_id > users.id

Ref: settlements.payer_id > users.id
Ref: settlements.receiver_id > users.id
Ref: settlements.group_id > groups.id
Ref: settlements.created_by > users.id

Ref: record_history.record_id > records.id
Ref: record_history.changed_by > users.id

```