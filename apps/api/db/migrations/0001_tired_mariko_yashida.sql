PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_friends` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_a_id` integer NOT NULL,
	`user_b_id` integer NOT NULL,
	`user_a_ows_b` real DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_a_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_b_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
-- Migrate existing data with normalized IDs
-- Transform: userAId = min(userId, friendId), userBId = max(userId, friendId)
-- Set userAowsB = 0.0 (balances will be recalculated from records later)
-- Handle duplicates by grouping and taking earliest created_at
INSERT INTO `__new_friends`("user_a_id", "user_b_id", "user_a_ows_b", "created_at")
SELECT 
	user_a_id,
	user_b_id,
	0.0 AS `user_a_ows_b`,
	MIN(`created_at`) AS `created_at`
FROM (
	SELECT 
		CASE WHEN `user_id` < `friend_id` THEN `user_id` ELSE `friend_id` END AS `user_a_id`,
		CASE WHEN `user_id` < `friend_id` THEN `friend_id` ELSE `user_id` END AS `user_b_id`,
		`created_at`
	FROM `friends`
	WHERE `status` = 'accepted' OR `status` = 'pending'
)
GROUP BY `user_a_id`, `user_b_id`;--> statement-breakpoint
DROP TABLE `friends`;--> statement-breakpoint
ALTER TABLE `__new_friends` RENAME TO `friends`;--> statement-breakpoint
PRAGMA foreign_keys=ON;