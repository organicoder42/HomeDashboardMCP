'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import DashboardEntries from '@/components/dashboard/dashboard-entries';

export default function DashboardPage() {
  const [showInfo, setShowInfo] = useState(false);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <LucideIcons.LayoutDashboard className="text-white" size={28} strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Tiimo Dashboard
                </h1>
              </div>
              <p className="text-gray-600 text-lg flex items-center gap-2">
                <LucideIcons.Calendar size={18} />
                {today}
              </p>
            </div>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-2 px-5 py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-purple-200 text-purple-700 font-medium"
            >
              <LucideIcons.Info size={20} />
              {showInfo ? 'Hide' : 'Show'} MCP Info
            </button>
          </div>

          <p className="text-gray-700 text-sm flex items-center gap-2 bg-white/60 backdrop-blur rounded-xl px-4 py-3 border border-purple-200 shadow-sm">
            <LucideIcons.Sparkles size={18} className="text-purple-600" />
            Visual planner powered by MCP - Manage your tasks with Claude
          </p>
        </motion.div>

        {/* Info Card (Collapsible) */}
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200 rounded-2xl p-6 mb-8 shadow-lg"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <LucideIcons.Zap className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-purple-900 mb-1">
                  MCP Integration
                </h2>
                <p className="text-purple-700 text-sm">
                  Connect Claude to this dashboard via Model Context Protocol
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 mb-4 border border-purple-200">
              <p className="text-sm text-gray-700 mb-2 font-medium">Endpoint URL:</p>
              <code className="block bg-purple-50 p-3 rounded-lg border border-purple-200 text-sm font-mono text-purple-900 break-all">
                {typeof window !== 'undefined' ? window.location.origin : ''}/api/mcp
              </code>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { icon: LucideIcons.PenSquare, name: 'write_dashboard_entry', desc: 'Create new tasks' },
                { icon: LucideIcons.Eye, name: 'get_dashboard_entries', desc: 'Retrieve tasks' },
                { icon: LucideIcons.Edit, name: 'update_dashboard_entry', desc: 'Update tasks' },
                { icon: LucideIcons.Trash2, name: 'delete_dashboard_entry', desc: 'Delete tasks' },
              ].map((tool, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-white p-3 rounded-xl border border-purple-200"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <tool.icon size={16} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <code className="text-xs font-mono text-purple-900 block truncate">
                      {tool.name}
                    </code>
                    <p className="text-xs text-gray-600">{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Entries */}
        <DashboardEntries />
      </div>
    </div>
  );
}
