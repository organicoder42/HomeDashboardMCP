'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { useTimer } from '@/hooks/useTimer';
import ProgressRing from './progress-ring';

interface CountdownTimerProps {
  duration: number; // minutes
  color?: string;
  onComplete?: () => void;
  autoStart?: boolean;
  compact?: boolean;
}

export default function CountdownTimer({
  duration,
  color = '#3B82F6',
  onComplete,
  autoStart = false,
  compact = false,
}: CountdownTimerProps) {
  const {
    remaining,
    percentage,
    isRunning,
    isComplete,
    start,
    pause,
    reset,
    toggle,
    remainingFormatted,
    durationFormatted,
  } = useTimer({ duration, onComplete, autoStart });

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative">
          <ProgressRing
            percentage={percentage}
            color={color}
            size={40}
            strokeWidth={6}
            showValue={false}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {isRunning ? (
              <LucideIcons.Pause size={16} style={{ color }} />
            ) : (
              <LucideIcons.Play size={16} style={{ color }} />
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-mono font-bold" style={{ color }}>
            {remainingFormatted}
          </span>
          <span className="text-xs text-gray-500">
            / {durationFormatted}
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border-2 shadow-lg"
      style={{ borderColor: color }}
    >
      {/* Progress Ring */}
      <div className="relative">
        <ProgressRing
          percentage={percentage}
          color={color}
          size={120}
          strokeWidth={8}
          showValue={false}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold font-mono" style={{ color }}>
              {remainingFormatted}
            </div>
            <div className="text-xs text-gray-500">
              {isComplete ? 'Complete!' : isRunning ? 'Remaining' : 'Paused'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!isComplete ? (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggle}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white shadow-md transition-all"
              style={{ backgroundColor: color }}
            >
              {isRunning ? (
                <>
                  <LucideIcons.Pause size={18} />
                  Pause
                </>
              ) : (
                <>
                  <LucideIcons.Play size={18} />
                  Start
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
            >
              <LucideIcons.RotateCcw size={18} />
              Reset
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="flex items-center gap-2 px-6 py-2 rounded-xl font-medium text-white shadow-md transition-all"
            style={{ backgroundColor: color }}
          >
            <LucideIcons.CheckCircle2 size={18} />
            Task Complete
          </motion.button>
        )}
      </div>

      {/* Duration Info */}
      <div className="text-xs text-gray-500 text-center">
        Total duration: {durationFormatted}
      </div>
    </motion.div>
  );
}
