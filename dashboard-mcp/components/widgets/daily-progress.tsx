'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import ProgressRing from '@/components/timer/progress-ring';

interface DailyProgressProps {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export default function DailyProgress({
  total,
  completed,
  inProgress,
  pending,
}: DailyProgressProps) {
  const completionRate = total > 0 ? (completed / total) * 100 : 0;
  const progressRate = total > 0 ? ((completed + inProgress) / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
          <LucideIcons.TrendingUp className="text-white" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-purple-900">Daily Progress</h3>
          <p className="text-sm text-purple-700">Your productivity today</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-6">
        {/* Completion Ring */}
        <div className="flex flex-col items-center">
          <ProgressRing
            percentage={completionRate}
            color="#8B5CF6"
            size={100}
            strokeWidth={10}
          />
          <p className="text-xs text-gray-600 mt-2 font-medium">Completed</p>
        </div>

        {/* Stats Grid */}
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <LucideIcons.CheckCircle2 size={16} className="text-green-600" />
              <span className="text-xs text-gray-600 font-medium">Done</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{completed}</p>
          </div>

          <div className="bg-white rounded-xl p-3 border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <LucideIcons.PlayCircle size={16} className="text-blue-600" />
              <span className="text-xs text-gray-600 font-medium">Active</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{inProgress}</p>
          </div>

          <div className="bg-white rounded-xl p-3 border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <LucideIcons.Circle size={16} className="text-orange-600" />
              <span className="text-xs text-gray-600 font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">{pending}</p>
          </div>

          <div className="bg-white rounded-xl p-3 border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <LucideIcons.ListTodo size={16} className="text-purple-600" />
              <span className="text-xs text-gray-600 font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">{total}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span className="font-medium">Overall Progress</span>
          <span className="font-bold">{Math.round(progressRate)}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressRate}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          {completed} completed, {inProgress} in progress, {pending} pending
        </p>
      </div>
    </motion.div>
  );
}
