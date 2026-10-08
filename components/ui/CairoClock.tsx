"use client";

import { useEffect, useState } from "react";

type CairoClockProps = {
  className?: string;
};

export default function CairoClock({
  className = "font-mono text-base font-medium text-dark-text",
}: CairoClockProps) {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Cairo",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });

    const update = () => setTime(formatter.format(new Date()));
    update();
    const timer = window.setInterval(update, 30000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className={className} dir="ltr">
      {time}
    </span>
  );
}