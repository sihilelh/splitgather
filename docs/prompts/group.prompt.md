Add Groups Prompt 

Goal: 
Context: 
# Creating group
Group icon and group name should be saved in the database, when user presses enter.
Then, all friends in the database should appear, so that user can select which ones to add.
Once "Create Group" is clicked, the group should be added to the database.
All groups saved including the newly created one should appear under "YOUR GROUPS".
Each group button should have the updated balance from the database (credit/debit/settled)
Once the group is clicked, new page should show, the name of the group with icon, current balance, group members and expenses with the amount.
In the right corner at the top there should be a "Exit group" button, so that the user can leave the group.
Group member section should have an "Add members" function where the user can add new members to the group.
When member is clicked from the group member section, there should be a function "Remove from group", to remove that friend from the group.

Constraints:
Keep other features as it is.
When adding friends to the group, the database should filter and show the names according to the letters typed by user.
All values should be displayed in "Rs" format.

Architectural Info:

# Settle up
Goal: Settling expenses within a group
Context: When the user clicks on the amount in each expense field, it should show two sections: "Owe You" and "You Owe".
Next to each friend, it should show the amount user owes to that specific friendin red, others owe user in green.
When you click that amount, there should be two options to either to select full or type in the amount you want to settle.
Once the user selects the option, the user can can click on the "Settle" button which settles the amount and updates the database accordingly.

Constraints:
Keep other features as it is.
When settling up, the database should update the balance of the user and the friend accordingly.

Architectural Info: