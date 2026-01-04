"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const onExpireRef = useRef(onExpire);

  // Update ref when onExpire changes
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Reset countdown when initialSeconds changes
  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  // Stable callback that uses ref
  const handleExpire = useCallback(() => {
    onExpireRef.current?.();
  }, []);

  // Single timer effect - doesn't re-run every second
  useEffect(() => {
    if (seconds <= 0) {
      handleExpire();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          handleExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSeconds, handleExpire]); // Only re-run when initialSeconds changes, not on every second

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
