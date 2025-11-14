import { createMcpHandler } from 'mcp-handler';
import { registerMcpTools } from '@/lib/mcp-tools';
import { NextRequest, NextResponse } from 'next/server';

// Create MCP handler with tool registrations
const handler = createMcpHandler((server) => {
  // Set server info
  server.setServerInfo({
    name: 'dashboard-mcp-server',
    version: '1.0.0',
  });

  // Register all MCP tools
  registerMcpTools(server);
});

// Authentication middleware
function authenticate(request: NextRequest): NextResponse | null {
  // Skip authentication in development mode
  if (process.env.NODE_ENV === 'development') {
    return null;
  }

  const apiKey = request.headers.get('x-api-key');
  const expectedApiKey = process.env.MCP_API_KEY;

  // If MCP_API_KEY is not set, allow access (backwards compatible)
  if (!expectedApiKey) {
    console.warn('WARNING: MCP_API_KEY not set. HTTP MCP endpoint is unprotected!');
    return null;
  }

  if (!apiKey || apiKey !== expectedApiKey) {
    return NextResponse.json(
      {
        error: 'Unauthorized',
        message: 'Valid API key required. Include X-API-Key header with your request.'
      },
      { status: 401 }
    );
  }

  return null; // Authentication successful
}

// Get the handlers from mcp-handler
const { GET: originalGET, POST: originalPOST } = handler;

// Wrap GET handler with authentication
export async function GET(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  return originalGET(request);
}

// Wrap POST handler with authentication
export async function POST(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  return originalPOST(request);
}
