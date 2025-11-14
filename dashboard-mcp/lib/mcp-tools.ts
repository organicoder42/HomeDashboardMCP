import { z } from 'zod';
import { db } from '@/db/client';
import { dashboardEntries, moodEntries, userPreferences } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { McpServer } from 'mcp-handler';

// Zod schemas for validation
const createEntrySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  // Tiimo-inspired visual fields
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color (e.g., #3B82F6)').optional(),
  icon: z.string().optional(),
  // Time management fields
  duration: z.number().int().positive().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  order: z.number().int().optional(),
});

const updateEntrySchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  // Tiimo-inspired visual fields
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color').optional(),
  icon: z.string().optional(),
  // Time management fields
  duration: z.number().int().positive().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  order: z.number().int().optional(),
});

const getEntriesSchema = z.object({
  limit: z.number().int().positive().optional().default(10),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  category: z.string().optional(),
});

const deleteEntrySchema = z.object({
  id: z.number().int().positive(),
});

// Register MCP tools
export function registerMcpTools(server: McpServer) {
  // Tool 1: Create dashboard entry
  server.tool(
    'write_dashboard_entry',
    'Create a new entry in the dashboard. Use this to add tasks, notes, or any information to track. Supports visual customization with colors and icons, plus time management fields.',
    createEntrySchema.shape,
    async ({ title, content, status, priority, category, tags, color, icon, duration, startTime, endTime, order }) => {
      try {
        const tagsJson = tags ? JSON.stringify(tags) : null;

        const [newEntry] = await db.insert(dashboardEntries).values({
          title,
          content,
          status: status || 'pending',
          priority: priority || 'medium',
          category,
          tags: tagsJson,
          color: color || '#3B82F6',
          icon: icon || 'circle',
          duration: duration,
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null,
          order: order || 0,
        }).returning();

        const details = [
          `ID: ${newEntry.id}`,
          `Title: ${newEntry.title}`,
          `Status: ${newEntry.status}`,
          `Priority: ${newEntry.priority}`,
          color && `Color: ${newEntry.color}`,
          icon && `Icon: ${newEntry.icon}`,
          duration && `Duration: ${duration} minutes`,
          `Created: ${new Date(newEntry.createdAt).toLocaleString()}`,
        ].filter(Boolean).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `✅ Dashboard entry created successfully!\n\n${details}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error creating dashboard entry: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Tool 2: Get dashboard entries
  server.tool(
    'get_dashboard_entries',
    'Retrieve dashboard entries. You can filter by status, category, and limit the number of results.',
    getEntriesSchema.shape,
    async ({ limit, status, category }) => {
      try {
        let query = db.select().from(dashboardEntries).orderBy(desc(dashboardEntries.createdAt));

        if (status) {
          query = query.where(eq(dashboardEntries.status, status)) as any;
        }

        if (category) {
          query = query.where(eq(dashboardEntries.category, category)) as any;
        }

        const entries = await query.limit(limit);

        if (entries.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: '📭 No dashboard entries found.',
              },
            ],
          };
        }

        const entriesText = entries.map((entry) => {
          const tags = entry.tags ? JSON.parse(entry.tags) : [];
          const details = [
            `ID: ${entry.id}`,
            `Title: ${entry.title}`,
            `Content: ${entry.content}`,
            `Status: ${entry.status}`,
            `Priority: ${entry.priority}`,
            `Category: ${entry.category || 'N/A'}`,
            entry.color && `Color: ${entry.color}`,
            entry.icon && `Icon: ${entry.icon}`,
            entry.duration && `Duration: ${entry.duration} minutes`,
            `Tags: ${tags.length > 0 ? tags.join(', ') : 'None'}`,
            `Created: ${new Date(entry.createdAt).toLocaleString()}`,
            `Updated: ${new Date(entry.updatedAt).toLocaleString()}`,
          ].filter(Boolean).join('\n');

          return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${details}`;
        }).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `📊 Found ${entries.length} dashboard entries:\n${entriesText}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error retrieving dashboard entries: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Tool 3: Update dashboard entry
  server.tool(
    'update_dashboard_entry',
    'Update an existing dashboard entry by ID. You can update any field including visual properties (color, icon), time management (duration, startTime), and content fields.',
    updateEntrySchema.shape,
    async ({ id, title, content, status, priority, category, tags, color, icon, duration, startTime, endTime, order }) => {
      try {
        const updateData: any = {
          updatedAt: new Date(),
        };

        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (status !== undefined) {
          updateData.status = status;
          // Set completedAt when marking as completed
          if (status === 'completed') {
            updateData.completedAt = new Date();
          }
        }
        if (priority !== undefined) updateData.priority = priority;
        if (category !== undefined) updateData.category = category;
        if (tags !== undefined) updateData.tags = JSON.stringify(tags);
        if (color !== undefined) updateData.color = color;
        if (icon !== undefined) updateData.icon = icon;
        if (duration !== undefined) updateData.duration = duration;
        if (startTime !== undefined) updateData.startTime = new Date(startTime);
        if (endTime !== undefined) updateData.endTime = new Date(endTime);
        if (order !== undefined) updateData.order = order;

        const [updatedEntry] = await db
          .update(dashboardEntries)
          .set(updateData)
          .where(eq(dashboardEntries.id, id))
          .returning();

        if (!updatedEntry) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Dashboard entry with ID ${id} not found.`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ Dashboard entry updated successfully!\n\nID: ${updatedEntry.id}\nTitle: ${updatedEntry.title}\nStatus: ${updatedEntry.status}\nPriority: ${updatedEntry.priority}\nUpdated: ${new Date(updatedEntry.updatedAt).toLocaleString()}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error updating dashboard entry: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Tool 4: Delete dashboard entry
  server.tool(
    'delete_dashboard_entry',
    'Delete a dashboard entry by ID. This action is permanent and cannot be undone.',
    deleteEntrySchema.shape,
    async ({ id }) => {
      try {
        const [deletedEntry] = await db
          .delete(dashboardEntries)
          .where(eq(dashboardEntries.id, id))
          .returning();

        if (!deletedEntry) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ Dashboard entry with ID ${id} not found.`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `✅ Dashboard entry deleted successfully!\n\nID: ${deletedEntry.id}\nTitle: ${deletedEntry.title}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ Error deleting dashboard entry: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Tool 5: Start task timer
  server.tool(
    'start_task_timer',
    'Start or resume the timer for a task. Tracks elapsed time for focus and productivity.',
    z.object({
      id: z.number().int().positive(),
    }).shape,
    async ({ id }) => {
      try {
        // Get current entry to check if timer exists
        const [entry] = await db.select().from(dashboardEntries).where(eq(dashboardEntries.id, id));

        if (!entry) {
          return {
            content: [{
              type: 'text',
              text: `❌ Dashboard entry with ID ${id} not found.`,
            }],
          };
        }

        if (!entry.duration) {
          return {
            content: [{
              type: 'text',
              text: `❌ Task "${entry.title}" has no duration set. Add a duration first.`,
            }],
          };
        }

        const timerState = {
          running: true,
          elapsed: 0,
          startedAt: Date.now(),
        };

        await db
          .update(dashboardEntries)
          .set({
            timerState: JSON.stringify(timerState),
            status: 'in_progress',
            updatedAt: new Date(),
          })
          .where(eq(dashboardEntries.id, id));

        return {
          content: [{
            type: 'text',
            text: `⏱️ Timer started for "${entry.title}"!\n\nDuration: ${entry.duration} minutes\nStatus: In Progress\n\nFocus on your task!`,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error starting timer: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
        };
      }
    }
  );

  // Tool 6: Pause task timer
  server.tool(
    'pause_task_timer',
    'Pause the running timer for a task. You can resume it later.',
    z.object({
      id: z.number().int().positive(),
    }).shape,
    async ({ id }) => {
      try {
        const [entry] = await db.select().from(dashboardEntries).where(eq(dashboardEntries.id, id));

        if (!entry) {
          return {
            content: [{
              type: 'text',
              text: `❌ Dashboard entry with ID ${id} not found.`,
            }],
          };
        }

        const currentState = entry.timerState ? JSON.parse(entry.timerState) : null;
        if (!currentState || !currentState.running) {
          return {
            content: [{
              type: 'text',
              text: `❌ No running timer for "${entry.title}".`,
            }],
          };
        }

        const elapsed = currentState.elapsed + Math.floor((Date.now() - currentState.startedAt) / 1000);
        const timerState = {
          running: false,
          elapsed,
          pausedAt: Date.now(),
        };

        await db
          .update(dashboardEntries)
          .set({
            timerState: JSON.stringify(timerState),
            updatedAt: new Date(),
          })
          .where(eq(dashboardEntries.id, id));

        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;

        return {
          content: [{
            type: 'text',
            text: `⏸️ Timer paused for "${entry.title}"\n\nElapsed: ${minutes}m ${seconds}s\nYou can resume anytime!`,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error pausing timer: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
        };
      }
    }
  );

  // Tool 7: Complete task with timer
  server.tool(
    'complete_task_timer',
    'Mark a task as completed and stop its timer. Records completion time.',
    z.object({
      id: z.number().int().positive(),
    }).shape,
    async ({ id }) => {
      try {
        const [entry] = await db.select().from(dashboardEntries).where(eq(dashboardEntries.id, id));

        if (!entry) {
          return {
            content: [{
              type: 'text',
              text: `❌ Dashboard entry with ID ${id} not found.`,
            }],
          };
        }

        const now = new Date();
        let elapsedText = '';

        if (entry.timerState) {
          const currentState = JSON.parse(entry.timerState);
          const elapsed = currentState.running
            ? currentState.elapsed + Math.floor((Date.now() - currentState.startedAt) / 1000)
            : currentState.elapsed;

          const minutes = Math.floor(elapsed / 60);
          const seconds = elapsed % 60;
          elapsedText = `\nTime spent: ${minutes}m ${seconds}s`;
        }

        await db
          .update(dashboardEntries)
          .set({
            status: 'completed',
            completedAt: now,
            timerState: null,
            updatedAt: now,
          })
          .where(eq(dashboardEntries.id, id));

        return {
          content: [{
            type: 'text',
            text: `✅ Congratulations! Task completed!\n\nTitle: "${entry.title}"${elapsedText}\nCompleted: ${now.toLocaleString()}\n\nGreat work! 🎉`,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error completing task: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
        };
      }
    }
  );

  // Tool 8: Reorder tasks
  server.tool(
    'reorder_tasks',
    'Reorder tasks by providing an array of task IDs in the desired order. Updates the order field for all tasks.',
    z.object({
      taskIds: z.array(z.number().int().positive()).min(1, 'At least one task ID is required'),
    }).shape,
    async ({ taskIds }) => {
      try {
        // Update each task's order based on its position in the array
        await Promise.all(
          taskIds.map((id, index) =>
            db
              .update(dashboardEntries)
              .set({ order: index, updatedAt: new Date() })
              .where(eq(dashboardEntries.id, id))
          )
        );

        return {
          content: [{
            type: 'text',
            text: `✅ Tasks reordered successfully!\n\nReordered ${taskIds.length} tasks.\nNew order: ${taskIds.join(', ')}`,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error reordering tasks: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
        };
      }
    }
  );

  // Tool 9: Log mood
  server.tool(
    'log_mood',
    'Log your current mood with optional note and energy level. Helps track emotional patterns and well-being over time.',
    z.object({
      mood: z.enum(['struggling', 'difficult', 'okay', 'good', 'great']),
      note: z.string().optional(),
      energyLevel: z.number().int().min(1).max(5).optional(),
      tags: z.array(z.string()).optional(),
    }).shape,
    async ({ mood, note, energyLevel, tags }) => {
      try {
        const tagsJson = tags ? JSON.stringify(tags) : null;

        const [newMood] = await db.insert(moodEntries).values({
          mood,
          note,
          energyLevel,
          tags: tagsJson,
        }).returning();

        const moodEmojis = {
          struggling: '😢',
          difficult: '😟',
          okay: '😐',
          good: '🙂',
          great: '😊',
        };

        return {
          content: [{
            type: 'text',
            text: `${moodEmojis[mood]} Mood logged successfully!\n\nFeeling: ${mood.charAt(0).toUpperCase() + mood.slice(1)}${energyLevel ? `\nEnergy Level: ${energyLevel}/5` : ''}${note ? `\nNote: ${note}` : ''}\n\nTake care of yourself! 💜`,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error logging mood: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
        };
      }
    }
  );

  // Tool 10: Get mood history
  server.tool(
    'get_mood_history',
    'Retrieve mood check-in history with optional filtering by days or limit.',
    z.object({
      limit: z.number().int().positive().optional().default(10),
      days: z.number().int().positive().optional(),
    }).shape,
    async ({ limit, days }) => {
      try {
        let query = db.select().from(moodEntries).orderBy(desc(moodEntries.createdAt));

        // Filter by days if specified
        if (days) {
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          query = query.where(desc(moodEntries.createdAt)) as any;
        }

        const moods = await query.limit(limit);

        if (moods.length === 0) {
          return {
            content: [{
              type: 'text',
              text: '📭 No mood entries found.\n\nStart tracking your mood to see patterns over time!',
            }],
          };
        }

        const moodEmojis = {
          struggling: '😢',
          difficult: '😟',
          okay: '😐',
          good: '🙂',
          great: '😊',
        };

        // Calculate stats
        const moodCounts = moods.reduce((acc, entry) => {
          acc[entry.mood] = (acc[entry.mood] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const mostCommon = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0];
        const avgEnergy = moods.filter(m => m.energyLevel).reduce((sum, m) => sum + (m.energyLevel || 0), 0) / moods.filter(m => m.energyLevel).length;

        const moodsText = moods.map((entry) => {
          return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${moodEmojis[entry.mood]} ${entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
${entry.energyLevel ? `Energy: ${entry.energyLevel}/5 ⚡` : ''}
${entry.note ? `Note: ${entry.note}` : ''}
Time: ${new Date(entry.createdAt).toLocaleString()}`;
        }).join('\n');

        return {
          content: [{
            type: 'text',
            text: `📊 Mood History (Last ${moods.length} entries)\n\n📈 STATS\nMost Common: ${moodEmojis[mostCommon[0] as keyof typeof moodEmojis]} ${mostCommon[0]} (${mostCommon[1]} times)\nAverage Energy: ${avgEnergy ? avgEnergy.toFixed(1) : 'N/A'}/5\n\n${moodsText}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nKeep track of your patterns! 💜`,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error retrieving mood history: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
        };
      }
    }
  );

  // Tool 11: Get user preferences
  server.tool(
    'get_user_preferences',
    'Retrieve the current user preferences including theme, font size, and accessibility settings.',
    z.object({}).shape,
    async () => {
      try {
        const DEFAULT_USER_ID = 'default';
        const [prefs] = await db
          .select()
          .from(userPreferences)
          .where(eq(userPreferences.userId, DEFAULT_USER_ID))
          .limit(1);

        if (!prefs) {
          return {
            content: [{
              type: 'text',
              text: `⚙️ No preferences set yet. Using defaults:\n\n🎨 Theme: Light\n📏 Font Size: Medium\n📖 Dyslexic Font: Off\n♿ Accessibility: Standard\n\nYou can customize these settings using update_user_preferences tool.`,
            }],
          };
        }

        const themeEmojis = { light: '☀️', dark: '🌙', 'high-contrast': '🔲' };
        const fontEmojis = { small: '🔤', medium: '🔡', large: '🔠', 'x-large': '🅰️' };

        return {
          content: [{
            type: 'text',
            text: `⚙️ Current User Preferences\n\n🎨 Theme: ${themeEmojis[prefs.theme as keyof typeof themeEmojis]} ${prefs.theme}\n📏 Font Size: ${fontEmojis[prefs.fontSize as keyof typeof fontEmojis]} ${prefs.fontSize}\n📖 Dyslexic Font: ${prefs.useDyslexicFont ? '✓ Enabled' : '✗ Disabled'}\n\n♿ Accessibility Features:\n${prefs.reducedMotion ? '✓' : '✗'} Reduced Motion\n${prefs.highContrast ? '✓' : '✗'} High Contrast Mode\n${prefs.screenReaderOptimized ? '✓' : '✗'} Screen Reader Optimized\n\n💡 Use update_user_preferences to change these settings.`,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error retrieving preferences: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
        };
      }
    }
  );

  // Tool 12: Update user preferences
  server.tool(
    'update_user_preferences',
    'Update user preferences for theme, font size, and accessibility features. Helps customize the dashboard experience for neurodivergent users.',
    z.object({
      theme: z.enum(['light', 'dark', 'high-contrast']).optional(),
      fontSize: z.enum(['small', 'medium', 'large', 'x-large']).optional(),
      useDyslexicFont: z.boolean().optional(),
      reducedMotion: z.boolean().optional(),
      highContrast: z.boolean().optional(),
      screenReaderOptimized: z.boolean().optional(),
    }).shape,
    async (updates) => {
      try {
        const DEFAULT_USER_ID = 'default';

        // Ensure preferences exist
        const [existing] = await db
          .select()
          .from(userPreferences)
          .where(eq(userPreferences.userId, DEFAULT_USER_ID))
          .limit(1);

        let result;
        if (!existing) {
          // Create new preferences
          [result] = await db
            .insert(userPreferences)
            .values({
              userId: DEFAULT_USER_ID,
              ...updates,
            })
            .returning();
        } else {
          // Update existing
          [result] = await db
            .update(userPreferences)
            .set({
              ...updates,
              updatedAt: new Date(),
            })
            .where(eq(userPreferences.userId, DEFAULT_USER_ID))
            .returning();
        }

        const changedFields = Object.keys(updates).join(', ');
        return {
          content: [{
            type: 'text',
            text: `✅ Preferences updated successfully!\n\nUpdated: ${changedFields}\n\n🎨 Current Settings:\nTheme: ${result.theme}\nFont Size: ${result.fontSize}\nDyslexic Font: ${result.useDyslexicFont ? 'On' : 'Off'}\n\nThe changes will take effect immediately in the dashboard! 🚀`,
          }],
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `❌ Error updating preferences: ${error instanceof Error ? error.message : 'Unknown error'}`,
          }],
        };
      }
    }
  );
}
