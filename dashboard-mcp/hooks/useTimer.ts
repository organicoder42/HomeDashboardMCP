'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerState {
  isRunning: boolean;
  elapsed: number; // seconds
  duration: number; // seconds
}

interface UseTimerOptions {
  duration: number; // minutes
  onComplete?: () => void;
  autoStart?: boolean;
}

export function useTimer({ duration, onComplete, autoStart = false }: UseTimerOptions) {
  const durationSeconds = duration * 60;
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setElapsed(0);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const toggle = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const newElapsed = prev + 1;

          // Check if timer is complete
          if (newElapsed >= durationSeconds) {
            setIsRunning(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            if (onComplete) {
              onComplete();
            }
            return durationSeconds;
          }

          return newElapsed;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, durationSeconds, onComplete]);

  const remaining = durationSeconds - elapsed;
  const percentage = (elapsed / durationSeconds) * 100;
  const isComplete = elapsed >= durationSeconds;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    elapsed,
    remaining,
    percentage,
    isRunning,
    isComplete,
    start,
    pause,
    reset,
    toggle,
    formatTime,
    elapsedFormatted: formatTime(elapsed),
    remainingFormatted: formatTime(remaining),
    durationFormatted: formatTime(durationSeconds),
  };
}
