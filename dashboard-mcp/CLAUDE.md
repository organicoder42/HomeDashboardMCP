# Dashboard MCP - Project Documentation

## Project Overview
Web-based dashboard with built-in MCP (Model Context Protocol) server for remote data management via Claude. Built with Next.js 16, Turso (SQLite), and deployed on Vercel.

## Tech Stack
- **Framework**: Next.js 16+ (App Router, TypeScript)
- **Database**: Turso (serverless SQLite)
- **ORM**: Drizzle ORM
- **MCP Server**: mcp-handler + @modelcontextprotocol/sdk
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Validation**: Zod

## Project Structure
```
dashboard-mcp/
├── app/
│   ├── api/
│   │   ├── mcp/route.ts         # MCP server endpoint (POST/GET)
│   │   └── entries/route.ts     # REST API for UI (GET)
│   ├── dashboard/page.tsx       # Dashboard UI
│   └── page.tsx                 # Home (redirects to dashboard)
├── db/
│   ├── schema.ts                # Database schema (dashboardEntries table)
│   └── client.ts                # Turso client configuration
├── lib/
│   └── mcp-tools.ts             # MCP tool definitions (4 tools)
├── components/
│   └── dashboard/
│       └── dashboard-entries.tsx # Dashboard entries component
├── drizzle/                     # Database migrations (generated)
├── drizzle.config.ts            # Drizzle configuration
├── .env.example                 # Environment variables template
└── CLAUDE.md                    # This file
```

## Database Schema
**Table**: `dashboard_entries`
- `id` (integer, primary key, auto-increment)
- `title` (text, required)
- `content` (text, required)
- `status` (enum: pending, in_progress, completed, cancelled)
- `priority` (enum: low, medium, high, urgent)
- `category` (text, optional)
- `tags` (text, JSON array string)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

## MCP Tools
The MCP server exposes 4 tools at `/api/mcp`:

### 1. write_dashboard_entry
Create new dashboard entries.
**Parameters**:
- title (string, required)
- content (string, required)
- status (enum, optional)
- priority (enum, optional)
- category (string, optional)
- tags (array, optional)

### 2. get_dashboard_entries
Retrieve dashboard entries with filtering.
**Parameters**:
- limit (number, default: 10)
- status (enum, optional)
- category (string, optional)

### 3. update_dashboard_entry
Update existing entry by ID.
**Parameters**:
- id (number, required)
- title, content, status, priority, category, tags (all optional)

### 4. delete_dashboard_entry
Delete entry by ID.
**Parameters**:
- id (number, required)

## Environment Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Turso Database
**Option A: Via Vercel Marketplace** (Recommended for deployment)
1. Go to https://vercel.com/marketplace/tursocloud
2. Create Turso database
3. Copy connection credentials

**Option B: Via Turso CLI** (For local development)
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Create database
turso db create dashboard-mcp

# Get database URL
turso db show dashboard-mcp

# Create auth token
turso db tokens create dashboard-mcp
```

### 3. Configure Environment Variables
Create `.env.local`:
```bash
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

### 4. Run Database Migrations
```bash
npm run db:push
```

## Development Commands
```bash
# Start development server
npm run dev

# Generate database migrations
npx drizzle-kit generate

# Push schema to database
npx drizzle-kit push

# Open Drizzle Studio (database GUI)
npx drizzle-kit studio

# Build for production
npm run build

# Start production server
npm start
```

## Code Style Guidelines
- Use TypeScript strict mode
- Prefer `async/await` over `.then()`
- Use Zod for all input validation
- Use Drizzle ORM queries (no raw SQL)
- Component files: PascalCase with `.tsx` extension
- Use Tailwind CSS classes (no inline styles)
- Server Components by default, Client Components with 'use client'
- Error handling: always wrap database operations in try/catch

## Testing MCP Tools Locally

### Using Claude Desktop
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "dashboard-mcp": {
      "command": "npx",
      "args": ["-y", "mcp-client", "http://localhost:3000/api/mcp"]
    }
  }
}
```

### Using Claude Code CLI
```bash
# Connect to local MCP server
claude --mcp http://localhost:3000/api/mcp

# Example prompts:
"Write a new dashboard entry with title 'Test Task' and content 'Testing MCP integration'"
"Show me the last 5 dashboard entries"
"Update entry ID 1 to status completed"
"Delete entry ID 2"
```

## Deployment to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: Dashboard MCP"
git branch -M main
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. Deploy

### 3. Connect MCP Client to Production
Update MCP client config with production URL:
```json
{
  "mcpServers": {
    "dashboard-mcp-prod": {
      "command": "npx",
      "args": ["-y", "mcp-client", "https://your-app.vercel.app/api/mcp"]
    }
  }
}
```

## MCP Server URL
- **Local**: `http://localhost:3000/api/mcp`
- **Production**: `https://your-app.vercel.app/api/mcp`

## Dashboard URL
- **Local**: `http://localhost:3000/dashboard`
- **Production**: `https://your-app.vercel.app/dashboard`

## Troubleshooting

### Database Connection Issues
- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set
- Check Turso database status: `turso db show dashboard-mcp`
- Ensure migrations are run: `npx drizzle-kit push`

### MCP Tools Not Working
- Verify MCP server is running: `curl http://localhost:3000/api/mcp`
- Check Claude Desktop/Code logs for connection errors
- Ensure database is populated: `npx drizzle-kit studio`

### UI Not Updating
- Check browser console for errors
- Verify API endpoint: `curl http://localhost:3000/api/entries`
- Dashboard polls every 5 seconds - wait for auto-refresh

## Best Practices
- Always validate input with Zod schemas
- Use descriptive commit messages
- Keep MCP tool descriptions clear and concise
- Test MCP tools locally before deploying
- Monitor Vercel logs for production errors
- Use Drizzle Studio to inspect database state
- Keep CLAUDE.md updated with changes

## Security Notes
- Never commit `.env.local` to git (included in .gitignore)
- Turso auth tokens should be kept secret
- MCP server has no authentication by default - add if needed
- Consider rate limiting for production MCP endpoints

## Performance Optimization
- Dashboard entries are limited to 50 by default
- Auto-refresh interval: 5 seconds (adjustable in component)
- Turso is edge-distributed for low latency
- Next.js uses automatic code splitting

## Future Enhancements
- Add authentication for MCP server
- Implement real-time updates with WebSockets
- Add bulk operations (delete multiple, update status)
- Export entries to CSV/JSON
- Dashboard analytics and charts
- User management and multi-tenancy

---

**Last Updated**: November 2025
**Version**: 1.0.0
**Maintained By**: Claude Code
**License**: MIT
