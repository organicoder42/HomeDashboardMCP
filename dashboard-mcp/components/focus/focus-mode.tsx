'use client';

import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { DashboardEntry } from '@/db/schema';
import CountdownTimer from '@/components/timer/countdown-timer';
import { formatDistanceToNow } from 'date-fns';

interface FocusModeProps {
  entry: DashboardEntry;
  onExit: () => void;
  onComplete: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export default function FocusMode({
  entry,
  onExit,
  onComplete,
  onNext,
  onPrevious,
}: FocusModeProps) {
  const tags = entry.tags ? JSON.parse(entry.tags) : [];

  // Get icon component dynamically
  const IconComponent = (LucideIcons as any)[
    entry.icon?.charAt(0).toUpperCase() + entry.icon?.slice(1) || 'Circle'
  ] || LucideIcons.Circle;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 z-50 overflow-auto"
    >
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        {/* Header Controls */}
        <div className="w-full max-w-4xl mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onPrevious && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPrevious}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-purple-200 text-purple-700 font-medium"
              >
                <LucideIcons.ChevronLeft size={20} />
                Previous
              </motion.button>
            )}
            {onNext && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNext}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-purple-200 text-purple-700 font-medium"
              >
                Next
                <LucideIcons.ChevronRight size={20} />
              </motion.button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onExit}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all border-2 border-gray-300 text-gray-700 font-medium"
          >
            <LucideIcons.X size={20} />
            Exit Focus
          </motion.button>
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-8 md:p-12 border-2"
          style={{ borderColor: entry.color || '#3B82F6' }}
        >
          {/* Icon and Title */}
          <div className="flex items-start gap-6 mb-8">
            <div
              className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: entry.color || '#3B82F6',
                color: 'white',
              }}
            >
              <IconComponent size={40} strokeWidth={2.5} />
            </div>

            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-3 leading-tight">
                {entry.title}
              </h1>

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                {entry.priority && (
                  <span className={`flex items-center gap-1 font-semibold ${getPriorityColor(entry.priority)}`}>
                    <LucideIcons.Flag size={16} />
                    {entry.priority}
                  </span>
                )}
                {entry.category && (
                  <span className="flex items-center gap-1 text-gray-600">
                    <LucideIcons.Folder size={16} />
                    {entry.category}
                  </span>
                )}
                {entry.duration && (
                  <span className="flex items-center gap-1 text-gray-600 font-medium">
                    <LucideIcons.Clock size={16} />
                    {entry.duration} minutes
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Description</h2>
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 rounded-xl text-sm font-medium border-2 border-purple-200"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timer */}
          {entry.duration && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-3">Focus Timer</h2>
              <div className="flex justify-center">
                <CountdownTimer
                  duration={entry.duration}
                  color={entry.color || '#3B82F6'}
                  onComplete={onComplete}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-4 pt-6 border-t-2 border-gray-200">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onComplete}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all"
              style={{ backgroundColor: entry.color || '#3B82F6' }}
            >
              <LucideIcons.CheckCircle2 size={20} />
              Mark Complete
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExit}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition-all"
            >
              <LucideIcons.Pause size={20} />
              Take a Break
            </motion.button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Created {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
            {' • '}
            ID: {entry.id}
          </div>
        </motion.div>

        {/* Helpful Tips */}
        <div className="w-full max-w-4xl mt-8 text-center">
          <p className="text-gray-600 text-sm">
            💡 <strong>Tip:</strong> Eliminate distractions and focus on one task at a time for better productivity
          </p>
        </div>
      </div>
    </motion.div>
  );
}
