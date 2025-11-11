import { createMcpHandler } from 'mcp-handler';
import { registerMcpTools } from '@/lib/mcp-tools';

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

// Export Next.js route handlers
export const { GET, POST } = handler;
