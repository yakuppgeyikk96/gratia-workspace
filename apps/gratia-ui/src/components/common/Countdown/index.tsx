"use client";

import { useEffect, useState } from "react";
import styles from "./Countdown.module.scss";

interface CountdownProps {
  initialSeconds: number;
  onExpire?: () => void;
  className?: string;
}

export default function Countdown({
  initialSeconds,
  onExpire,
  className = "",
}: CountdownProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      onExpire?.();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onExpire]);

  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const isLowTime = seconds < 300;

  return (
    <div
      className={`${styles.countdown} ${isLowTime ? styles.warning : ""} ${className}`}
    >
      <span className={styles.label}>Session expires in:</span>
      <span className={styles.time}>{formatTime(seconds)}</span>
    </div>
  );
}
