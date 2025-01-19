import { pgTable, serial, text, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';

export const leads = pgTable('leads', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	source: varchar('source', { length: 100 }).notNull(),
	owner: varchar('owner', { length: 100 }).notNull(),
	stage: varchar('stage', { length: 50 }).default('New Lead').notNull(),
	createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
});
