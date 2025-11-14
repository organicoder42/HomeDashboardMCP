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

// User preferences table
export const userPreferences = sqliteTable('user_preferences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').default('default').notNull(), // For future multi-user support

  // Theme & Appearance
  theme: text('theme', { enum: ['light', 'dark', 'high-contrast'] }).default('light'),
  fontSize: text('font_size', { enum: ['small', 'medium', 'large', 'x-large'] }).default('medium'),
  useDyslexicFont: integer('use_dyslexic_font', { mode: 'boolean' }).default(false),

  // Widget Layout (JSON array of widget configs)
  widgetLayout: text('widget_layout'), // JSON: [{id, position, visible, size}, ...]

  // Accessibility
  reducedMotion: integer('reduced_motion', { mode: 'boolean' }).default(false),
  highContrast: integer('high_contrast', { mode: 'boolean' }).default(false),
  screenReaderOptimized: integer('screen_reader_optimized', { mode: 'boolean' }).default(false),

  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

export type DashboardEntry = typeof dashboardEntries.$inferSelect;
export type NewDashboardEntry = typeof dashboardEntries.$inferInsert;
export type MoodEntry = typeof moodEntries.$inferSelect;
export type NewMoodEntry = typeof moodEntries.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
export type NewUserPreference = typeof userPreferences.$inferInsert;
