Settle Up

The system should support **settling balances between people**, where settlements reduce outstanding debts without changing the original expense records.

#### Purpose

Settling up is used when one person pays back another person, fully or partially, for previously shared expenses. A settlement is a **balance adjustment transaction**, not a new expense.

#### Settle Up Behavior

1. A user should be able to create a **settlement record** between two people or among group members.
2. A settlement must specify:

   * Who is paying
   * Who is receiving
   * Amount being settled
   * Date of settlement
   * Optional note or description
   * Optional group or context the settlement belongs to
3. When a settlement is created:

   * The payer’s **owed balance** should decrease by the settlement amount
   * The receiver’s **lent balance** should decrease by the settlement amount
   * The system must ensure that balances are updated consistently in all related tables
4. Settlements can be:

   * **Full settlement**: clears the entire outstanding balance between two users
   * **Partial settlement**: clears only part of the balance
5. A user should also be able to choose:

   * **Settle with a specific person**
   * **Settle all balances in a group**
   * **Auto-simplify debts** if the system supports minimizing the number of transactions

#### Validation Rules

* A settlement amount cannot be negative or zero.
* A settlement amount cannot exceed the current outstanding payable balance between the selected users unless overpayment is explicitly supported.
* The system must verify that both users exist and that there is an actual unsettled balance before creating the settlement.
* If settling within a group, the system should validate that both users belong to that group.
* The system must prevent duplicate or conflicting settlement entries.

#### Balance Calculation Rules

* Settlements should **not modify the original expense record values**.
* Settlements should only affect the **net balances** between users.
* After settlement, the updated balances should reflect:

  * Reduced amount owed by the debtor
  * Reduced amount receivable by the creditor
* The total system balance must remain consistent after each settlement.

#### Storage / Data Handling

* A settlement should be stored as its own transaction type, separate from normal expense records.
* The system should update:

  * **Friends table** for display and current balance tracking
  * **Settlement records table** or equivalent ledger for audit/history
  * Any derived balance summaries used in the app
* Original expense records and record splits must remain unchanged for historical accuracy.

#### Editing / Deleting Settlements

* Users should be able to edit or delete a settlement record.
* When a settlement is edited:

  * The old settlement effect must first be reversed
  * Then the new settlement values must be applied
* When a settlement is deleted:

  * The system must restore the previous outstanding balances correctly
* The system should validate that editing or deletion does not produce invalid negative balances unless such behavior is explicitly allowed.

#### History and Audit Trail

* Every settlement creation, edit, and deletion should be logged in a history trail.
* Users should be able to view:

  * When the settlement was made
  * Who paid whom
  * Original amount
  * Updated amount if edited
  * Who performed the action
* This ensures traceability and prevents confusion in group balance changes.

#### Group Settlement Logic

If the app supports groups:

* The system may calculate each member’s net position in the group:

  * **Positive balance** = others owe them
  * **Negative balance** = they owe others
* The settle-up feature may generate recommended settlement transactions to minimize the number of payments needed.
* Example:

  * A owes 50
  * B is owed 20
  * C is owed 30
  * The system may recommend:

    * A pays B 20
    * A pays C 30

#### Display Requirements

* The UI should clearly distinguish:

  * **Expenses**
  * **Settlements**
* For each friendship or group, the app should show:

  * Current net balance
  * Settlement history
  * Remaining unpaid balance after settlements
* A fully settled relationship should display as **“settled up”** or **“no balance”**.