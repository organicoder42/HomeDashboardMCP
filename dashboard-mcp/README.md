# Dashboard MCP

Et webbaseret dashboard med indbygget MCP (Model Context Protocol) server, der gør det muligt at skrive direkte til dashboardet via Claude Code eller Claude Desktop fra hvilken som helst computer.

## Features

- **MCP Integration**: Skriv til dashboardet via Claude AI tools
- **Real-time Dashboard**: Automatisk opdatering hvert 5. sekund
- **Full CRUD**: Create, Read, Update, Delete entries via MCP
- **Edge Database**: Turso (SQLite) - globalt distribueret, lav latency
- **Type-safe**: Full TypeScript support med Zod validation
- **Deploy Anywhere**: Optimeret til Vercel deployment

## Tech Stack

- **Next.js 16** - React framework med App Router
- **Turso** - Serverless SQLite database
- **Drizzle ORM** - Type-safe database queries
- **MCP Handler** - Model Context Protocol server
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type safety
- **Zod** - Runtime validation

## Quick Start

### 1. Installation

```bash
cd dashboard-mcp
npm install
```

### 2. Database Setup

**Option A: Turso CLI (Anbefalet til lokal udvikling)**

```bash
# Installer Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Opret database
turso db create dashboard-mcp

# Vis database info
turso db show dashboard-mcp

# Opret auth token
turso db tokens create dashboard-mcp
```

**Option B: Vercel Marketplace (Til deployment)**

1. Gå til https://vercel.com/marketplace/tursocloud
2. Opret Turso database
3. Kopiér connection credentials

### 3. Environment Variables

Opret `.env.local`:

```bash
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

### 4. Database Migration

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Åbn http://localhost:3000 i din browser.

## MCP Tools

Dashboardet eksponerer 4 MCP tools på `/api/mcp`:

### 1. `write_dashboard_entry`
Opret en ny entry i dashboardet.

**Parametre:**
- `title` (string, required) - Titel på entry
- `content` (string, required) - Indhold/beskrivelse
- `status` (enum, optional) - pending | in_progress | completed | cancelled
- `priority` (enum, optional) - low | medium | high | urgent
- `category` (string, optional) - Kategori
- `tags` (array, optional) - Liste af tags

**Eksempel:**
```
"Skriv en ny entry til mit dashboard med title 'Deploy website' og content 'Deploy the new dashboard to production'"
```

### 2. `get_dashboard_entries`
Hent dashboard entries med filtrering.

**Parametre:**
- `limit` (number, optional, default: 10) - Antal entries at hente
- `status` (enum, optional) - Filtrer på status
- `category` (string, optional) - Filtrer på kategori

**Eksempel:**
```
"Vis mig de seneste 5 entries fra mit dashboard"
"Vis alle completed entries"
```

### 3. `update_dashboard_entry`
Opdater en eksisterende entry.

**Parametre:**
- `id` (number, required) - Entry ID
- `title`, `content`, `status`, `priority`, `category`, `tags` (alle optional)

**Eksempel:**
```
"Opdater entry ID 3 til status completed"
"Ændr title på entry 5 til 'Updated Task Name'"
```

### 4. `delete_dashboard_entry`
Slet en entry permanent.

**Parametre:**
- `id` (number, required) - Entry ID

**Eksempel:**
```
"Slet entry ID 7 fra mit dashboard"
```

## Connect MCP Client

### Claude Desktop

Tilføj til `claude_desktop_config.json`:

**Local development:**
```json
{
  "mcpServers": {
    "dashboard-mcp-local": {
      "command": "npx",
      "args": ["-y", "mcp-client", "http://localhost:3000/api/mcp"]
    }
  }
}
```

**Production:**
```json
{
  "mcpServers": {
    "dashboard-mcp": {
      "command": "npx",
      "args": ["-y", "mcp-client", "https://your-app.vercel.app/api/mcp"]
    }
  }
}
```

### Claude Code CLI

```bash
# Connect til lokal server
claude --mcp http://localhost:3000/api/mcp

# Connect til production
claude --mcp https://your-app.vercel.app/api/mcp
```

## Deployment til Vercel

### 1. Push til GitHub

```bash
git init
git add .
git commit -m "Initial commit: Dashboard MCP"
git branch -M main
git remote add origin https://github.com/yourusername/dashboard-mcp.git
git push -u origin main
```

### 2. Deploy på Vercel

1. Gå til https://vercel.com/new
2. Import din GitHub repository
3. Tilføj environment variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. Klik "Deploy"

### 3. Kør Database Migration

Efter deployment, kør migration:

```bash
# Via Vercel CLI
vercel env pull .env.local
npm run db:push
```

### 4. Test MCP Connection

Opdater din MCP client config med production URL og test:

```
"Skriv en test entry til mit dashboard"
"Vis alle entries"
```

## NPM Scripts

```bash
# Udvikling
npm run dev              # Start development server
npm run build            # Build til production
npm start                # Start production server

# Database
npm run db:generate      # Generér migrations
npm run db:push          # Push schema til database
npm run db:studio        # Åbn Drizzle Studio (database GUI)
```

## Project Structure

```
dashboard-mcp/
├── app/
│   ├── api/
│   │   ├── mcp/route.ts         # MCP server endpoint
│   │   └── entries/route.ts     # REST API for UI
│   ├── dashboard/page.tsx       # Dashboard UI
│   └── page.tsx                 # Home (redirect)
├── db/
│   ├── schema.ts                # Database schema
│   └── client.ts                # Turso client
├── lib/
│   └── mcp-tools.ts             # MCP tool definitions
├── components/
│   └── dashboard/
│       └── dashboard-entries.tsx
├── drizzle.config.ts            # Drizzle configuration
├── CLAUDE.md                    # Detailed project docs
└── README.md                    # This file
```

## Database Schema

**Table: `dashboard_entries`**

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| title | TEXT | Entry title |
| content | TEXT | Entry content |
| status | TEXT | pending, in_progress, completed, cancelled |
| priority | TEXT | low, medium, high, urgent |
| category | TEXT | Optional category |
| tags | TEXT | JSON array of tags |
| createdAt | INTEGER | Unix timestamp |
| updatedAt | INTEGER | Unix timestamp |

## Development Tips

### Inspect Database

```bash
# Åbn Drizzle Studio
npm run db:studio
```

Åbner GUI på http://localhost:4983

### Test MCP Endpoint

```bash
# Test at MCP server kører
curl http://localhost:3000/api/mcp

# Test entries API
curl http://localhost:3000/api/entries
```

### Debug MCP Tools

Se CLAUDE.md for detaljerede instruktioner om debugging og troubleshooting.

## Troubleshooting

### Database Connection Error

Verificer at environment variables er sat korrekt:

```bash
echo $TURSO_DATABASE_URL
echo $TURSO_AUTH_TOKEN
```

Tjek database status:

```bash
turso db show dashboard-mcp
```

### MCP Tools Virker Ikke

1. Tjek at MCP server kører: `curl http://localhost:3000/api/mcp`
2. Verificer MCP client konfiguration
3. Tjek Claude Desktop/Code logs
4. Kør `npm run db:studio` for at se om database indeholder data

### UI Opdaterer Ikke

Dashboard auto-refresher hvert 5. sekund. Hvis entries ikke vises:

1. Tjek browser console for errors
2. Verificer API: `curl http://localhost:3000/api/entries`
3. Tjek at database er populated: `npm run db:studio`

## Use Cases

- **Task Tracking**: Tilføj og track opgaver via Claude
- **Note Taking**: Skriv noter fra hvor som helst via Claude
- **Project Management**: Opdater projekt status via voice/chat
- **Quick Logging**: Log events eller metrics via MCP
- **Team Dashboard**: Del dashboard URL, skriv via MCP

## Security

### 🔐 HTTP MCP Endpoint Authentication

HTTP MCP endpoint (`/api/mcp`) er **beskyttet med API key authentication** i production.

**Setup:**

1. Generér en sikker API key:
```bash
openssl rand -base64 32
```

2. Tilføj til Vercel Environment Variables:
   - **Name:** `MCP_API_KEY`
   - **Value:** Din genererede API key

3. Brug API key når du forbinder:
```bash
# Claude Code med authentication
claude --mcp https://your-app.vercel.app/api/mcp \
  --header "X-API-Key: your-api-key"

# Curl eksempel
curl https://your-app.vercel.app/api/mcp \
  -H "X-API-Key: your-api-key" \
  -d '{"jsonrpc":"2.0","method":"tools/list","id":1}'
```

**Development Mode:**
- Authentication er **disabled** i development (`npm run dev`)
- Ingen API key nødvendig for lokal test

**📖 Se [SECURITY.md](./SECURITY.md) for detaljeret security guide**

### Vigtige Security Notes

- ✅ HTTP MCP endpoint har API key authentication (production)
- ✅ Turso database kræver auth token
- ✅ Alle environment variables er gitignored
- ⚠️ Dashboard UI (`/dashboard`) er public (read-only)
- ⚠️ Entries API (`/api/entries`) er public (read-only)

## Performance

- Dashboard auto-refresh: 5 sekunder (konfigurerbart)
- Max entries per load: 50 (konfigurerbart)
- Turso er edge-distributed for lav latency
- Next.js automatic code splitting

## Roadmap

- [ ] Authentication for MCP endpoint
- [ ] Real-time updates med WebSockets
- [ ] Bulk operations (multi-delete, bulk status update)
- [ ] Export til CSV/JSON
- [ ] Dashboard analytics og charts
- [ ] Multi-user support
- [ ] Search functionality
- [ ] Filtering på tags

## Support

Læs CLAUDE.md for detaljeret dokumentation og troubleshooting.

## License

MIT

---

**Built with Claude Code - November 2025**
