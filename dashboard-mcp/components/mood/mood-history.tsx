'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import type { MoodEntry } from '@/db/schema';
import { formatDistanceToNow } from 'date-fns';

interface MoodHistoryProps {
  moods: MoodEntry[];
  compact?: boolean;
}

const moodConfig = {
  struggling: { emoji: '😢', label: 'Struggling', color: '#EF4444', bg: 'bg-red-100' },
  difficult: { emoji: '😟', label: 'Difficult', color: '#F59E0B', bg: 'bg-orange-100' },
  okay: { emoji: '😐', label: 'Okay', color: '#6B7280', bg: 'bg-gray-100' },
  good: { emoji: '🙂', label: 'Good', color: '#3B82F6', bg: 'bg-blue-100' },
  great: { emoji: '😊', label: 'Great', color: '#10B981', bg: 'bg-green-100' },
};

export default function MoodHistory({ moods, compact = false }: MoodHistoryProps) {
  if (moods.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <LucideIcons.Smile size={48} className="mx-auto mb-3 opacity-50" />
        <p className="text-sm">No mood entries yet</p>
        <p className="text-xs mt-1">Start tracking your mood to see patterns</p>
      </div>
    );
  }

  // Calculate mood stats
  const moodCounts = moods.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageEnergy = moods
    .filter(m => m.energyLevel)
    .reduce((sum, m) => sum + (m.energyLevel || 0), 0) / moods.filter(m => m.energyLevel).length;

  const mostCommon = Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0];

  if (compact) {
    return (
      <div className="space-y-3">
        {/* Quick Stats */}
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{mostCommon && moodConfig[mostCommon as keyof typeof moodConfig]?.emoji}</span>
            <div>
              <p className="text-xs text-gray-600">Most Common</p>
              <p className="text-sm font-bold text-gray-900">{mostCommon && moodConfig[mostCommon as keyof typeof moodConfig]?.label}</p>
            </div>
          </div>
          {averageEnergy && (
            <div className="text-right">
              <p className="text-xs text-gray-600">Avg Energy</p>
              <p className="text-sm font-bold text-purple-600">{averageEnergy.toFixed(1)}/5</p>
            </div>
          )}
        </div>

        {/* Recent Moods Timeline */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {moods.slice(0, 14).reverse().map((mood, index) => (
            <motion.div
              key={mood.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`flex-shrink-0 w-10 h-10 rounded-full ${moodConfig[mood.mood]?.bg} flex items-center justify-center text-xl border-2 border-white shadow-sm`}
              title={`${moodConfig[mood.mood]?.label} - ${formatDistanceToNow(new Date(mood.createdAt), { addSuffix: true })}`}
            >
              {moodConfig[mood.mood]?.emoji}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <LucideIcons.TrendingUp size={18} className="text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Most Common</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{mostCommon && moodConfig[mostCommon as keyof typeof moodConfig]?.emoji}</span>
            <div>
              <p className="text-lg font-bold text-gray-900">{mostCommon && moodConfig[mostCommon as keyof typeof moodConfig]?.label}</p>
              <p className="text-xs text-gray-600">{moodCounts[mostCommon]} times</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <LucideIcons.Zap size={18} className="text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Average Energy</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-blue-900">{averageEnergy ? averageEnergy.toFixed(1) : 'N/A'}</p>
            <span className="text-lg text-gray-600">/5</span>
          </div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-1.5 flex-1 rounded-full ${
                  level <= Math.round(averageEnergy || 0) ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Mood Timeline */}
      <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <LucideIcons.Calendar size={16} />
          Recent Check-ins
        </h4>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {moods.slice(0, 10).map((mood, index) => (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-start gap-3 p-3 rounded-xl ${moodConfig[mood.mood]?.bg} border border-gray-200`}
            >
              <span className="text-2xl flex-shrink-0">{moodConfig[mood.mood]?.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 text-sm">{moodConfig[mood.mood]?.label}</span>
                  {mood.energyLevel && (
                    <span className="text-xs text-gray-600">⚡ {mood.energyLevel}/5</span>
                  )}
                </div>
                {mood.note && (
                  <p className="text-xs text-gray-700 mb-1">{mood.note}</p>
                )}
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(mood.createdAt), { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mood Distribution */}
      <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <LucideIcons.BarChart3 size={16} />
          Distribution
        </h4>
        <div className="space-y-2">
          {Object.entries(moodCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([mood, count]) => {
              const percentage = (count / moods.length) * 100;
              const config = moodConfig[mood as keyof typeof moodConfig];
              return (
                <div key={mood} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{config?.emoji}</span>
                      <span className="font-medium">{config?.label}</span>
                    </span>
                    <span className="text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: config?.color }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </motion.div>
  );
}
