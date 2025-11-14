import { z } from 'zod';
import { db } from '@/db/client';
import { dashboardEntries } from '@/db/schema';
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
}
