import { useCallback, useEffect, useRef, useState } from "react";

export function useOverlay() {
  const [shown, setShown] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setShown(true));
    });

    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      pending.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const leave = useCallback((callback: () => void) => {
    setLeaving(true);
    timers.current.push(window.setTimeout(callback, 300));
  }, []);

  return { visible: shown && !leaving, containerVisible: true, leave };
}
