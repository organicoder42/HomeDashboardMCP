'use client';

import { useState, useEffect } from 'react';
import type { DashboardEntry } from '@/db/schema';

export default function DashboardEntries() {
  const [entries, setEntries] = useState<DashboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchEntries();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchEntries, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  async function fetchEntries() {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      const response = await fetch(`/api/entries?${params}`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No entries found</p>
          <p className="text-gray-400 text-sm mt-2">
            Use the MCP tools to add entries to your dashboard
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {entries.map((entry) => {
            const tags = entry.tags ? JSON.parse(entry.tags) : [];
            return (
              <div
                key={entry.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {entry.title}
                  </h3>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                        entry.priority || 'medium'
                      )}`}
                    >
                      {entry.priority}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        entry.status || 'pending'
                      )}`}
                    >
                      {entry.status?.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                  {entry.content}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {entry.category && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Category:</span>
                      {entry.category}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="font-medium">ID:</span>
                    {entry.id}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Created:</span>
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {tags.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
