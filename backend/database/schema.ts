import { sql } from 'drizzle-orm';
import { int, integer, primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const Users = sqliteTable('users', {
    username: text('username').primaryKey().notNull(),
    administrator: int({ mode: 'boolean' }).default(false).notNull(),
    passwordHash: text('passwordHash').notNull(),
});

export const Sessions = sqliteTable('sessions', {
    username: text('username')
        .references(() => Users.username, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    token: text('token').primaryKey().notNull(),
    creationDate: integer('creationDate', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});

export const Projects = sqliteTable('projects', {
    name: text('name').primaryKey().notNull(),
    owner: text('owner')
        .references(() => Users.username, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    creationDate: integer('creationDate', { mode: 'timestamp' })
        .default(sql`(strftime('%s', 'now'))`)
        .notNull(),
});

export const Versions = sqliteTable(
    'versions',
    {
        id: int('id').primaryKey({ autoIncrement: true }),
        version: text('version').notNull(),
        project: text('project')
            .references(() => Projects.name, { onDelete: 'cascade', onUpdate: 'cascade' })
            .notNull(),
        creationDate: integer('creationDate', { mode: 'timestamp' })
            .default(sql`(strftime('%s', 'now'))`)
            .notNull(),
    },
    (table) => [unique('uniqueVersion').on(table.version, table.project)]
);

export const Files = sqliteTable(
    'files',
    {
        name: text('name').notNull(),
        version: int('version')
            .references(() => Versions.id, { onDelete: 'cascade', onUpdate: 'cascade' })
            .notNull(),
        creationDate: integer('creationDate', { mode: 'timestamp' })
            .default(sql`(strftime('%s', 'now'))`)
            .notNull(),
        url: text('url').notNull(),
    },
    (table) => [primaryKey({ columns: [table.name, table.version] })]
);
