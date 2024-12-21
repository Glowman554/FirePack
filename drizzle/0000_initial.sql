CREATE TABLE `files` (
	`name` text NOT NULL,
	`version` integer NOT NULL,
	`creationDate` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`url` text NOT NULL,
	PRIMARY KEY(`name`, `version`),
	FOREIGN KEY (`version`) REFERENCES `versions`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`name` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`creationDate` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `users`(`username`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`username` text NOT NULL,
	`token` text PRIMARY KEY NOT NULL,
	`creationDate` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`username` text PRIMARY KEY NOT NULL,
	`administrator` integer DEFAULT false NOT NULL,
	`passwordHash` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`version` text NOT NULL,
	`project` text NOT NULL,
	`creationDate` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`project`) REFERENCES `projects`(`name`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniqueVersion` ON `versions` (`version`,`project`);