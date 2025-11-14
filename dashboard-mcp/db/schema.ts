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

  // Tiimo-inspired visual fields
  color: text('color').default('#3B82F6'), // Hex color for visual coding
  icon: text('icon').default('circle'), // Icon name from lucide-react
  order: integer('order').default(0), // Sequence order for drag-and-drop

  // Time management fields
  duration: integer('duration'), // Estimated duration in minutes
  startTime: integer('start_time', { mode: 'timestamp' }), // Optional scheduled start time
  endTime: integer('end_time', { mode: 'timestamp' }), // Optional scheduled end time
  completedAt: integer('completed_at', { mode: 'timestamp' }), // When task was completed
  timerState: text('timer_state'), // JSON: {running: boolean, elapsed: number, pausedAt: timestamp}

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

// Mood tracking table
export const moodEntries = sqliteTable('mood_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  mood: text('mood', { enum: ['struggling', 'difficult', 'okay', 'good', 'great'] }).notNull(),
  note: text('note'), // Optional context note
  energyLevel: integer('energy_level'), // 1-5 scale
  tags: text('tags'), // JSON array of associated activities/contexts
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type DashboardEntry = typeof dashboardEntries.$inferSelect;
export type NewDashboardEntry = typeof dashboardEntries.$inferInsert;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type NewMoodEntry = typeof moodEntries.$inferInsert;
