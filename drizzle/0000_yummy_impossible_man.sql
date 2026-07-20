CREATE TABLE `journal_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phase_id` integer NOT NULL,
	`title` text NOT NULL,
	`story` text NOT NULL,
	`lesson` text DEFAULT '' NOT NULL,
	`author` text DEFAULT 'Mahtab & Tom' NOT NULL,
	`happened_at` text NOT NULL,
	`image_key` text,
	`image_type` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `phase_checks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phase_id` integer NOT NULL,
	`item_key` text NOT NULL,
	`checked` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `phase_check_unique` ON `phase_checks` (`phase_id`,`item_key`);