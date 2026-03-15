PRAGMA foreign_keys=OFF;
--> statement-breakpoint
-- Add icon field to groups table
CREATE TABLE `__new_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`icon` text,
	`created_by` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_groups`("id", "name", "description", "created_by", "created_at")
SELECT "id", "name", "description", "created_by", "created_at" FROM `groups`;
--> statement-breakpoint
DROP TABLE `groups`;
--> statement-breakpoint
ALTER TABLE `__new_groups` RENAME TO `groups`;
--> statement-breakpoint
-- Add ows_amount field to group_participants table
CREATE TABLE `__new_group_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`ows_amount` real DEFAULT 0 NOT NULL,
	`joined_at` integer NOT NULL,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_group_participants`("id", "group_id", "user_id", "joined_at")
SELECT "id", "group_id", "user_id", "joined_at" FROM `group_participants`;
--> statement-breakpoint
DROP TABLE `group_participants`;
--> statement-breakpoint
ALTER TABLE `__new_group_participants` RENAME TO `group_participants`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
