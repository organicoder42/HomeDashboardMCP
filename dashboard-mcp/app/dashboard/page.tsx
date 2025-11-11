import DashboardEntries from '@/components/dashboard/dashboard-entries';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard MCP
          </h1>
          <p className="text-gray-600 text-lg">
            Managed via Model Context Protocol - Add entries using Claude Code
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            How to use MCP tools
          </h2>
          <div className="text-blue-800 space-y-2">
            <p>Connect to this MCP server from Claude Desktop or Claude Code:</p>
            <code className="block bg-white p-3 rounded border border-blue-200 text-sm mt-2">
              {typeof window !== 'undefined' ? window.location.origin : ''}/api/mcp
            </code>
            <p className="mt-3 font-medium">Available tools:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><code className="text-sm">write_dashboard_entry</code> - Create new entries</li>
              <li><code className="text-sm">get_dashboard_entries</code> - Retrieve entries</li>
              <li><code className="text-sm">update_dashboard_entry</code> - Update existing entries</li>
              <li><code className="text-sm">delete_dashboard_entry</code> - Delete entries</li>
            </ul>
          </div>
        </div>

        {/* Entries */}
        <DashboardEntries />
      </div>
    </div>
  );
}
