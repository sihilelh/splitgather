Add/Edit Record Prompt

Goal: Adding or editing expense records in the system
Context: This is a expense sharing application where a user can pay for something for all the members in the group (or with just another friend) and pay those people back later. The user can also edit the records.

When adding the record user will have these optinos

1. Add a new record with the following details:
   - Description of the expense
   - Amount paid
   - Date of the expense
   - List of people involved in the expense (who paid and who owes)
   - Optionally, a category for the expense (e.g., food, travel, utilities)
   - Then the owed_amount and lend_amount will be calculated based on the amount paid and the number of people involved in the expense. The system should ensure that the total owed amount matches the total lend amount for each record.
2. Edit an existing record by providing the record ID and the new details (same as above).
   - The user should be able to update any of the fields mentioned above for the existing record.
   - The system should validate the input data and ensure that the record ID exists before making any changes.
   - After editing, the system should recalculate the owed_amount and lend_amount based on the updated details and ensure consistency in the records (deduct the last owed_amount and lend_amount from the previous record and add the new owed_amount and lend_amount to the respective users).
Constraints:
 - The amounts can be devided evenly, or by percentage, or by specific amounts for each person.
 - The system should handle cases where the amount cannot be divided evenly and provide options for rounding or adjusting the amounts to ensure that the total owed and lend amounts are accurate.
 - The system should also handle cases where a user is added or removed from the expense after it has been created, and adjust the owed and lend amounts accordingly.
 - The system should maintain a history of changes for each record, allowing users to see the previous versions of the record and the changes made over time.
Architectural Info:
Every record is stored in two places. Friends table (for display purposes and settle purposes), records and record splits. The functionality should be clearly seperated.