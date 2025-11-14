# Security Guide - Dashboard MCP

## 🔐 HTTP MCP Endpoint Authentication

The HTTP MCP endpoint (`/api/mcp`) is protected with API key authentication in production.

### Setup API Key

**1. Generate a secure API key:**

```bash
openssl rand -base64 32
```

**2. Add to Vercel Environment Variables:**

Go to your Vercel project settings → Environment Variables → Add:

- **Name:** `MCP_API_KEY`
- **Value:** Your generated API key (e.g., `dGVzdF9hcGlfa2V5XzEyMzQ1Njc4OTA=`)
- **Environments:** Production, Preview (optional)

**3. Redeploy:**

After adding the environment variable, redeploy your application or wait for the next deployment.

---

## 🌐 Using the Protected HTTP MCP Endpoint

### From Claude Code CLI

```bash
# Add API key as header
claude --mcp https://your-app.vercel.app/api/mcp \
  --header "X-API-Key: your-api-key-here"
```

### From Custom Applications

```typescript
const response = await fetch('https://your-app.vercel.app/api/mcp', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here'
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    method: "tools/call",
    params: {
      name: "write_dashboard_entry",
      arguments: {
        title: "Secure Entry",
        content: "This was sent with authentication"
      }
    },
    id: 1
  })
});
```

### From Curl

```bash
curl https://your-app.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/list",
    "id": 1
  }'
```

---

## 🛡️ Security Features

### ✅ What's Protected

- **HTTP MCP Endpoint** (`/api/mcp`) - Requires `X-API-Key` header in production
- **Turso Database** - Requires auth token, encrypted connections
- **Environment Variables** - Never committed to git, only in Vercel/local

### ⚠️ What's NOT Protected (by default)

- **Dashboard UI** (`/dashboard`) - Publicly accessible (read-only)
- **Entries API** (`/api/entries`) - Publicly accessible (read-only)

### Development Mode

Authentication is **disabled** in development mode (`NODE_ENV=development`) for easier local testing.

---

## 🔒 Additional Security Recommendations

### 1. Add UI Authentication

For production dashboards, consider adding authentication to the UI:

```typescript
// middleware.ts
export { auth as middleware } from "@/auth"

export const config = {
  matcher: ["/dashboard/:path*"]
}
```

### 2. Rate Limiting

Add rate limiting to prevent abuse:

```typescript
// app/api/mcp/route.ts
import { rateLimit } from '@/lib/rate-limit'

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})

export async function POST(request: NextRequest) {
  try {
    await limiter.check(request, 10) // 10 requests per minute
  } catch {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }
  // ... rest of handler
}
```

### 3. IP Whitelisting

Restrict access to specific IPs via Vercel Edge Config or middleware.

### 4. CORS Configuration

Restrict which domains can call your API:

```typescript
// app/api/mcp/route.ts
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = ['https://your-domain.com']

  if (origin && !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'CORS not allowed' }, { status: 403 })
  }
  // ... rest of handler
}
```

---

## 🚨 Security Best Practices

1. **Never commit secrets** - Use `.env.local` for local development
2. **Rotate API keys** regularly - Generate new keys every few months
3. **Use HTTPS only** - Vercel handles this automatically
4. **Monitor access logs** - Check Vercel logs for suspicious activity
5. **Keep dependencies updated** - Run `npm audit` regularly

---

## 📋 Environment Variables Checklist

### Required (All Environments)
- ✅ `TURSO_DATABASE_URL` - Database connection URL
- ✅ `TURSO_AUTH_TOKEN` - Database authentication token

### Recommended (Production)
- ✅ `MCP_API_KEY` - HTTP MCP endpoint authentication
- ⚪ `NODE_ENV=production` - Automatically set by Vercel

### Optional (Enhanced Security)
- ⚪ `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- ⚪ `MAX_REQUESTS_PER_MINUTE` - Rate limit configuration

---

## 🆘 Troubleshooting

### "Unauthorized" Error

**Problem:** Getting 401 Unauthorized when calling HTTP MCP endpoint

**Solutions:**
1. Check that `MCP_API_KEY` is set in Vercel environment variables
2. Verify you're sending the correct API key in `X-API-Key` header
3. Ensure you've redeployed after adding the environment variable

### Authentication Skipped in Production

**Problem:** No authentication required even in production

**Causes:**
- `MCP_API_KEY` environment variable is not set
- Check Vercel logs for "WARNING: MCP_API_KEY not set" message

**Solution:**
1. Add `MCP_API_KEY` to Vercel environment variables
2. Redeploy the application

---

## 📞 Questions?

For security concerns or questions, please review the [CLAUDE.md](./CLAUDE.md) documentation or open an issue on GitHub.

**Remember:** Security is a shared responsibility. Keep your API keys secret and rotate them regularly! 🔐
