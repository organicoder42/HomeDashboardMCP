'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { DashboardEntry } from '@/db/schema';
import { formatDistanceToNow } from 'date-fns';
import CountdownTimer from '@/components/timer/countdown-timer';
import { useState } from 'react';

interface TaskCardProps {
  entry: DashboardEntry;
  isDragging?: boolean;
  onFocus?: () => void;
  onStatusChange?: (newStatus: string) => void;
}

export default function TaskCard({ entry, isDragging = false, onFocus, onStatusChange }: TaskCardProps) {
  const tags = entry.tags ? JSON.parse(entry.tags) : [];
  const [showTimer, setShowTimer] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Get icon component dynamically
  const IconComponent = (LucideIcons as any)[
    entry.icon?.charAt(0).toUpperCase() + entry.icon?.slice(1) || 'Circle'
  ] || LucideIcons.Circle;

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'in_progress': return '▶️';
      case 'pending': return '○';
      case 'cancelled': return '✕';
      default: return '○';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-50 border-gray-200 text-gray-600';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 font-bold';
      case 'high':
        return 'text-orange-600 font-semibold';
      case 'medium':
        return 'text-blue-600';
      case 'low':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`group relative ${getStatusColor(entry.status || 'pending')} rounded-2xl border-2 p-5 transition-all hover:shadow-lg ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        borderLeftWidth: '6px',
        borderLeftColor: entry.color || '#3B82F6',
      }}
    >
      {/* Color indicator bar */}
      <div
        className="absolute top-0 left-0 w-2 h-full rounded-l-2xl opacity-60"
        style={{ backgroundColor: entry.color || '#3B82F6' }}
      />

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
          style={{
            backgroundColor: entry.color || '#3B82F6',
            color: 'white',
          }}
        >
          <IconComponent size={24} strokeWidth={2.5} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">
              {entry.title}
            </h3>
            <span className="text-2xl flex-shrink-0" title={entry.status || 'pending'}>
              {getStatusEmoji(entry.status || 'pending')}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
            {entry.content}
          </p>

          {/* Metadata row */}
          <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
            {entry.duration && (
              <span className="flex items-center gap-1 font-medium">
                <LucideIcons.Clock size={14} />
                {entry.duration}m
              </span>
            )}
            {entry.priority && (
              <span className={`flex items-center gap-1 ${getPriorityColor(entry.priority)}`}>
                <LucideIcons.Flag size={14} />
                {entry.priority}
              </span>
            )}
            {entry.category && (
              <span className="flex items-center gap-1">
                <LucideIcons.Folder size={14} />
                {entry.category}
              </span>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/60 text-gray-700 rounded-full text-xs font-medium border border-gray-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Timer Section */}
          {entry.duration && entry.status !== 'completed' && (
            <div className="mb-3">
              {showTimer ? (
                <div className="bg-white/80 rounded-xl p-3 border border-gray-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">Focus Timer</span>
                    <button
                      onClick={() => setShowTimer(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <LucideIcons.X size={14} />
                    </button>
                  </div>
                  <CountdownTimer
                    duration={entry.duration}
                    color={entry.color || '#3B82F6'}
                    compact={true}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowTimer(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-white/80 hover:bg-white rounded-lg text-xs font-medium transition-all border border-gray-300 hover:border-gray-400"
                  style={{ color: entry.color || '#3B82F6' }}
                >
                  <LucideIcons.Timer size={14} />
                  Start {entry.duration}m timer
                </button>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {entry.completedAt
                ? `Completed ${formatDistanceToNow(new Date(entry.completedAt), { addSuffix: true })}`
                : `Created ${formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}`}
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              ID: {entry.id}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions - Top Right */}
      <div className="absolute top-3 right-3">
        {showActions ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1 bg-white rounded-xl shadow-lg p-1 border-2 border-gray-300"
          >
            {onFocus && entry.status !== 'completed' && (
              <button
                onClick={onFocus}
                className="p-2 hover:bg-purple-50 rounded-lg transition-colors"
                title="Focus Mode"
              >
                <LucideIcons.Focus size={16} className="text-purple-600" />
              </button>
            )}
            {entry.status !== 'completed' && onStatusChange && (
              <button
                onClick={() => onStatusChange('completed')}
                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                title="Mark Complete"
              >
                <LucideIcons.CheckCircle2 size={16} className="text-green-600" />
              </button>
            )}
            {entry.status === 'pending' && onStatusChange && (
              <button
                onClick={() => onStatusChange('in_progress')}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                title="Start Task"
              >
                <LucideIcons.Play size={16} className="text-blue-600" />
              </button>
            )}
            {entry.status === 'in_progress' && onStatusChange && (
              <button
                onClick={() => onStatusChange('pending')}
                className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                title="Pause Task"
              >
                <LucideIcons.Pause size={16} className="text-yellow-600" />
              </button>
            )}
            <button
              onClick={() => setShowActions(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LucideIcons.X size={16} className="text-gray-600" />
            </button>
          </motion.div>
        ) : (
          <button
            onClick={() => setShowActions(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white rounded-lg"
            title="Quick Actions"
          >
            <LucideIcons.MoreVertical size={20} className="text-gray-600" />
          </button>
        )}
      </div>

      {/* Drag handle indicator */}
      <div className="absolute top-3 right-12 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
        <LucideIcons.GripVertical size={20} className="text-gray-600" />
      </div>
    </motion.div>
  );
}
