'use client';

import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface ProgressRingProps {
  percentage: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  text?: string;
}

export default function ProgressRing({
  percentage,
  color = '#3B82F6',
  size = 80,
  strokeWidth = 8,
  showValue = true,
  text,
}: ProgressRingProps) {
  return (
    <div style={{ width: size, height: size }}>
      <CircularProgressbar
        value={percentage}
        text={text || (showValue ? `${Math.round(percentage)}%` : '')}
        styles={buildStyles({
          pathColor: color,
          textColor: color,
          trailColor: `${color}20`,
          strokeLinecap: 'round',
          pathTransitionDuration: 0.5,
          textSize: '24px',
        })}
        strokeWidth={strokeWidth}
      />
    </div>
  );
}
