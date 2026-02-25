import { useState, useEffect, useCallback } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const useCountdown = (targetDate: Date | string | null) => {
  // Initialize with zeros to avoid hydration mismatch
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const calculateTime = useCallback(() => {
    if (!targetDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const now = new Date().getTime();
    const end = typeof targetDate === 'string' ? new Date(targetDate).getTime() : targetDate.getTime();
    const distance = end - now;

    if (distance < 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(distance / (1000 * 60 * 60 * 24)),
      hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((distance % (1000 * 60)) / 1000)
    };
  }, [targetDate]);

  useEffect(() => {
    // Only run on client
    if (!targetDate) return;

    // Run immediately inside the interval callback effectively, 
    // or just accept that the first render might be 00:00:00 or handle it via a layout effect if critical.
    // However, simply calling it immediately is often fine if we ignore the linter or move it.
    // Better approach to satisfy linter and React best practices:
    
    const update = () => {
        setTimeLeft(calculateTime());
    };

    update(); // Run once immediately
    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, [targetDate, calculateTime]);

  return timeLeft;
};
