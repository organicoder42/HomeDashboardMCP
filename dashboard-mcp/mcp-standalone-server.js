#!/usr/bin/env node

/**
 * Standalone MCP Server for Dashboard
 * This allows Claude Desktop to connect via stdio
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql, eq, desc } from 'drizzle-orm';

// Define schema inline
const dashboardEntries = sqliteTable('dashboard_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  status: text('status', { enum: ['pending', 'in_progress', 'completed', 'cancelled'] }).default('pending'),
  priority: text('priority', { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium'),
  category: text('category'),
  tags: text('tags'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});

// Environment variables are passed from Claude Desktop config
// No need to load .env.local here

// Create Turso client
const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const db = drizzle(tursoClient, { schema: { dashboardEntries } });

// Create MCP server
const server = new Server(
  {
    name: 'dashboard-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Set up request handlers BEFORE connecting
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'write_dashboard_entry',
        description: 'Create a new entry in the dashboard. Use this to add tasks, notes, or any information to track.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'Title of the entry' },
            content: { type: 'string', description: 'Content/description of the entry' },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'cancelled'],
              description: 'Status of the entry'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'Priority level'
            },
            category: { type: 'string', description: 'Category of the entry' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for the entry'
            },
          },
          required: ['title', 'content'],
        },
      },
      {
        name: 'get_dashboard_entries',
        description: 'Retrieve dashboard entries. You can filter by status, category, and limit the number of results.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number of entries to retrieve', default: 10 },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'cancelled'],
              description: 'Filter by status'
            },
            category: { type: 'string', description: 'Filter by category' },
          },
        },
      },
      {
        name: 'update_dashboard_entry',
        description: 'Update an existing dashboard entry by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Entry ID to update' },
            title: { type: 'string', description: 'New title' },
            content: { type: 'string', description: 'New content' },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'cancelled'],
              description: 'New status'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: 'New priority'
            },
            category: { type: 'string', description: 'New category' },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'New tags'
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_dashboard_entry',
        description: 'Delete a dashboard entry by ID. This action is permanent.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'Entry ID to delete' },
          },
          required: ['id'],
        },
      },
    ],
  };
});

// Tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'write_dashboard_entry') {
      const { title, content, status, priority, category, tags } = args;
      const tagsJson = tags ? JSON.stringify(tags) : null;

      const [newEntry] = await db.insert(dashboardEntries).values({
        title,
        content,
        status: status || 'pending',
        priority: priority || 'medium',
        category,
        tags: tagsJson,
      }).returning();

      return {
        content: [
          {
            type: 'text',
            text: `✅ Dashboard entry created successfully!\n\nID: ${newEntry.id}\nTitle: ${newEntry.title}\nStatus: ${newEntry.status}\nPriority: ${newEntry.priority}\nCreated: ${new Date(newEntry.createdAt).toLocaleString()}`,
          },
        ],
      };
    }

    if (name === 'get_dashboard_entries') {
      const { limit = 10, status, category } = args;

      let query = db.select().from(dashboardEntries).orderBy(desc(dashboardEntries.createdAt));

      if (status) {
        query = query.where(eq(dashboardEntries.status, status));
      }

      if (category) {
        query = query.where(eq(dashboardEntries.category, category));
      }

      const entries = await query.limit(limit);

      if (entries.length === 0) {
        return {
          content: [{ type: 'text', text: '📭 No dashboard entries found.' }],
        };
      }

      const entriesText = entries.map((entry) => {
        const tags = entry.tags ? JSON.parse(entry.tags) : [];
        return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ID: ${entry.id}
Title: ${entry.title}
Content: ${entry.content}
Status: ${entry.status}
Priority: ${entry.priority}
Category: ${entry.category || 'N/A'}
Tags: ${tags.length > 0 ? tags.join(', ') : 'None'}
Created: ${new Date(entry.createdAt).toLocaleString()}`;
      }).join('\n');

      return {
        content: [
          {
            type: 'text',
            text: `📊 Found ${entries.length} dashboard entries:\n${entriesText}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          },
        ],
      };
    }

    if (name === 'update_dashboard_entry') {
      const { id, title, content, status, priority, category, tags } = args;

      const updateData = { updatedAt: new Date() };
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (status !== undefined) updateData.status = status;
      if (priority !== undefined) updateData.priority = priority;
      if (category !== undefined) updateData.category = category;
      if (tags !== undefined) updateData.tags = JSON.stringify(tags);

      const [updatedEntry] = await db
        .update(dashboardEntries)
        .set(updateData)
        .where(eq(dashboardEntries.id, id))
        .returning();

      if (!updatedEntry) {
        return {
          content: [{ type: 'text', text: `❌ Dashboard entry with ID ${id} not found.` }],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ Dashboard entry updated successfully!\n\nID: ${updatedEntry.id}\nTitle: ${updatedEntry.title}\nStatus: ${updatedEntry.status}\nPriority: ${updatedEntry.priority}`,
          },
        ],
      };
    }

    if (name === 'delete_dashboard_entry') {
      const { id } = args;

      const [deletedEntry] = await db
        .delete(dashboardEntries)
        .where(eq(dashboardEntries.id, id))
        .returning();

      if (!deletedEntry) {
        return {
          content: [{ type: 'text', text: `❌ Dashboard entry with ID ${id} not found.` }],
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
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.stderr.write(`Fatal error: ${error.message}\n`);
  process.exit(1);
});
