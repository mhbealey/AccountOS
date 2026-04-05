'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface HealthGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

function getHealthColor(score: number) {
  if (score <= 30) return { text: 'text-red-400', bg: 'bg-red-400', stroke: '#f87171' };
  if (score <= 60) return { text: 'text-yellow-400', bg: 'bg-yellow-400', stroke: '#facc15' };
  if (score <= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-400', stroke: '#34d399' };
  return { text: 'text-blue-400', bg: 'bg-blue-400', stroke: '#60a5fa' };
}

function getHealthLabel(score: number) {
  if (score <= 30) return 'Critical';
  if (score <= 60) return 'At Risk';
  if (score <= 80) return 'Healthy';
  return 'Thriving';
}

const sizes = {
  sm: { width: 60, strokeWidth: 6, fontSize: 'text-sm', radius: 24 },
  md: { width: 100, strokeWidth: 8, fontSize: 'text-xl', radius: 40 },
  lg: { width: 140, strokeWidth: 10, fontSize: 'text-3xl', radius: 56 },
};

export function HealthGauge({ score, size = 'md', showLabel = true, className }: HealthGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = getHealthColor(clampedScore);
  const label = getHealthLabel(clampedScore);
  const { width, strokeWidth, fontSize, radius } = sizes[size];

  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference * 0.75;
  const dashOffset = halfCircumference - (halfCircumference * clampedScore) / 100;

  const center = width / 2;

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="relative" style={{ width, height: width }}>
        <svg width={width} height={width} viewBox={`0 0 ${width} ${width}`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#1e1e3a"
            strokeWidth={strokeWidth}
            strokeDasharray={`${halfCircumference} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(135 ${center} ${center})`}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${halfCircumference} ${circumference}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(135 ${center} ${center})`}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', fontSize, color.text)}>{clampedScore}</span>
        </div>
      </div>
      {showLabel && (
        <span className={cn('text-xs font-medium', color.text)}>{label}</span>
      )}
    </div>
  );
}
