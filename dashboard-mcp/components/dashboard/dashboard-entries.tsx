'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { DashboardEntry } from '@/db/schema';
import TimelineView from './timeline-view';
import TaskCard from './task-card';
import DailyProgress from '@/components/widgets/daily-progress';

export default function DashboardEntries() {
  const [entries, setEntries] = useState<DashboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

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

  // Stats calculation
  const stats = {
    total: entries.length,
    completed: entries.filter(e => e.status === 'completed').length,
    inProgress: entries.filter(e => e.status === 'in_progress').length,
    pending: entries.filter(e => e.status === 'pending').length,
  };

  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading your tasks...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Progress Widget */}
      <DailyProgress
        total={stats.total}
        completed={stats.completed}
        inProgress={stats.inProgress}
        pending={stats.pending}
      />

      {/* Stats Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border-2 border-blue-200">
          <div className="flex items-center gap-3">
            <LucideIcons.ListTodo className="text-blue-600" size={32} strokeWidth={2.5} />
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Tasks</p>
              <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border-2 border-green-200">
          <div className="flex items-center gap-3">
            <LucideIcons.CheckCircle2 className="text-green-600" size={32} strokeWidth={2.5} />
            <div>
              <p className="text-sm text-green-700 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border-2 border-purple-200">
          <div className="flex items-center gap-3">
            <LucideIcons.PlayCircle className="text-purple-600" size={32} strokeWidth={2.5} />
            <div>
              <p className="text-sm text-purple-700 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-purple-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border-2 border-orange-200">
          <div className="flex items-center gap-3">
            <LucideIcons.Target className="text-orange-600" size={32} strokeWidth={2.5} />
            <div>
              <p className="text-sm text-orange-700 font-medium">Completion Rate</p>
              <p className="text-3xl font-bold text-orange-900">{completionRate}%</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter and View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'in_progress', 'completed', 'cancelled'].map((status) => {
            const count = status === 'all' ? stats.total : entries.filter(e => e.status === status).length;
            return (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl font-medium transition-all shadow-sm ${
                  filter === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                <span className={`ml-2 text-xs ${filter === status ? 'text-white' : 'text-gray-500'}`}>
                  ({count})
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* View mode toggle */}
        <div className="flex gap-2 bg-white rounded-xl p-1 border-2 border-gray-200 shadow-sm">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewMode === 'timeline'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LucideIcons.Calendar size={18} />
            Timeline
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <LucideIcons.List size={18} />
            List
          </button>
        </div>
      </div>

      {/* Entries Display */}
      <AnimatePresence mode="wait">
        {entries.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300"
          >
            <LucideIcons.Inbox className="mx-auto text-gray-400 mb-4" size={64} strokeWidth={1.5} />
            <p className="text-gray-600 text-xl font-semibold mb-2">No tasks found</p>
            <p className="text-gray-500 text-sm">
              Use the MCP tools to add tasks to your dashboard
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {viewMode === 'timeline' ? (
              <TimelineView entries={entries} />
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <TaskCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
