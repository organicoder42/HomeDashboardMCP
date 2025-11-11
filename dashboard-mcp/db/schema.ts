import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const dashboardEntries = sqliteTable('dashboard_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: text('status', { enum: ['pending', 'in_progress', 'completed', 'cancelled'] }).default('pending'),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium'),
  category: text('category'),
  tags: text('tags'), // JSON string of tags array
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type DashboardEntry = typeof dashboardEntries.$inferSelect;
export type NewDashboardEntry = typeof dashboardEntries.$inferInsert;
