'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

interface CountdownTimerProps {
  deadline: string | Date;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  onExpired?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isUrgent: boolean;
  isWarning: boolean;
}

function calculateTimeLeft(deadline: Date): TimeLeft {
  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true, isUrgent: false, isWarning: false };
  }

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    isUrgent: difference < 1000 * 60 * 60, // < 1 hour
    isWarning: difference < 1000 * 60 * 60 * 24, // < 24 hours
  };
}

export function CountdownTimer({ deadline, label, size = 'md', onExpired }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(new Date(deadline)));
  const [justExpired, setJustExpired] = useState(false);

  const handleRefresh = useCallback(() => {
    const newTimeLeft = calculateTimeLeft(new Date(deadline));
    setTimeLeft(newTimeLeft);
    if (onExpired) onExpired();
  }, [deadline, onExpired]);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(new Date(deadline));
      setTimeLeft(newTimeLeft);

      // Detect when it just expired
      if (newTimeLeft.isExpired && !timeLeft.isExpired) {
        setJustExpired(true);
        if (onExpired) onExpired();
        setTimeout(() => setJustExpired(false), 2000);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline, timeLeft.isExpired, onExpired]);

  if (timeLeft.isExpired) {
    return (
      <div className={`flex items-center gap-2 ${justExpired ? 'countdown-celebrate' : 'countdown-expired'}`}>
        <span className="text-xs font-medium countdown-expired-text flex items-center gap-1">
          ⏰ انتهى أجل التسجيل
        </span>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50"
          aria-label="تحديث"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const unitSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  };

  const colorClass = timeLeft.isUrgent
    ? 'text-red-600 dark:text-red-400'
    : timeLeft.isWarning
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-emerald-600 dark:text-emerald-400';

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-muted-foreground text-xs">{label}</span>
      )}
      <div className={`flex items-center gap-1.5 ${sizeClasses[size]}`}>
        {timeLeft.days > 0 && (
          <div className="flex items-center gap-0.5">
            <span className={`font-bold tabular-nums ${colorClass}`}>
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span className={`text-muted-foreground ${unitSizeClasses[size]}`}>يوم</span>
          </div>
        )}
        <div className="flex items-center gap-0.5">
          <span className={`font-bold tabular-nums ${colorClass}`}>
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className={`text-muted-foreground ${unitSizeClasses[size]}`}>س</span>
        </div>
        <span className={colorClass}>:</span>
        <div className="flex items-center gap-0.5">
          <span className={`font-bold tabular-nums ${colorClass}`}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className={`text-muted-foreground ${unitSizeClasses[size]}`}>د</span>
        </div>
        <span className={colorClass}>:</span>
        <div className="flex items-center gap-0.5">
          <span className={`font-bold tabular-nums ${colorClass}`}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className={`text-muted-foreground ${unitSizeClasses[size]}`}>ث</span>
        </div>
      </div>
    </div>
  );
}
