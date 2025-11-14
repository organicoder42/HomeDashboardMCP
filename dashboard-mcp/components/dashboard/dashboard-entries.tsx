'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { DashboardEntry } from '@/db/schema';
import TimelineView from './timeline-view';
import TaskCard from './task-card';
import DailyProgress from '@/components/widgets/daily-progress';
import FocusMode from '@/components/focus/focus-mode';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function DashboardEntries() {
  const [entries, setEntries] = useState<DashboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [focusEntry, setFocusEntry] = useState<DashboardEntry | null>(null);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);

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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: 'f',
        description: 'Focus on first pending task',
        callback: () => {
          const firstPending = entries.find(e => e.status !== 'completed');
          if (firstPending) setFocusEntry(firstPending);
        },
      },
      {
        key: 't',
        description: 'Toggle timeline/list view',
        callback: () => setViewMode(prev => prev === 'timeline' ? 'list' : 'timeline'),
      },
      {
        key: '?',
        shift: true,
        description: 'Show keyboard shortcuts',
        callback: () => setShowShortcutsHelp(prev => !prev),
      },
      {
        key: 'Escape',
        description: 'Close focus mode or shortcuts help',
        callback: () => {
          if (focusEntry) setFocusEntry(null);
          if (showShortcutsHelp) setShowShortcutsHelp(false);
        },
      },
    ],
    enabled: !focusEntry, // Disable when in focus mode
  });

  // Handlers
  const handleFocus = (entry: DashboardEntry) => {
    setFocusEntry(entry);
  };

  const handleStatusChange = async (entryId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        fetchEntries(); // Refresh
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCompleteFromFocus = async () => {
    if (!focusEntry) return;
    await handleStatusChange(focusEntry.id, 'completed');
    setFocusEntry(null);
  };

  const handleNavigateFocus = (direction: 'next' | 'previous') => {
    if (!focusEntry) return;
    const currentIndex = entries.findIndex(e => e.id === focusEntry.id);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < entries.length) {
      setFocusEntry(entries[newIndex]);
    }
  };

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
                  <TaskCard
                    key={entry.id}
                    entry={entry}
                    onFocus={() => handleFocus(entry)}
                    onStatusChange={(newStatus) => handleStatusChange(entry.id, newStatus)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Help Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={() => setShowShortcutsHelp(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:shadow-xl transition-shadow"
        title="Keyboard Shortcuts"
      >
        <LucideIcons.Keyboard size={24} />
      </motion.button>

      {/* Keyboard Shortcuts Help Overlay */}
      <AnimatePresence>
        {showShortcutsHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowShortcutsHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
                <button
                  onClick={() => setShowShortcutsHelp(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LucideIcons.X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <span className="text-gray-700 font-medium">Focus on first pending task</span>
                  <kbd className="px-3 py-1 bg-white rounded-lg text-sm font-mono shadow-sm border border-gray-300">F</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-gray-700 font-medium">Toggle timeline/list view</span>
                  <kbd className="px-3 py-1 bg-white rounded-lg text-sm font-mono shadow-sm border border-gray-300">T</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-pink-50 rounded-xl border border-pink-200">
                  <span className="text-gray-700 font-medium">Show shortcuts</span>
                  <kbd className="px-3 py-1 bg-white rounded-lg text-sm font-mono shadow-sm border border-gray-300">Shift + ?</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-gray-700 font-medium">Close/Exit</span>
                  <kbd className="px-3 py-1 bg-white rounded-lg text-sm font-mono shadow-sm border border-gray-300">ESC</kbd>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center mt-6">
                💡 These shortcuts work when not focused on input fields
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Focus Mode */}
      <AnimatePresence>
        {focusEntry && (
          <FocusMode
            entry={focusEntry}
            onExit={() => setFocusEntry(null)}
            onComplete={handleCompleteFromFocus}
            onNext={() => handleNavigateFocus('next')}
            onPrevious={() => handleNavigateFocus('previous')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
