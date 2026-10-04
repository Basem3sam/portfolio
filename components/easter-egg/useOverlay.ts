import { useCallback, useEffect, useRef, useState } from "react";

export function useOverlay() {
  const [shown, setShown] = useState(false);
  const [containerShown, setContainerShown] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    const frame = requestAnimationFrame(() => setShown(true));
    pending.push(window.setTimeout(() => setContainerShown(true), 100));

    return () => {
      cancelAnimationFrame(frame);
      pending.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const leave = useCallback((callback: () => void) => {
    setLeaving(true);
    timers.current.push(window.setTimeout(callback, 300));
  }, []);

  return { visible: shown && !leaving, containerVisible: containerShown, leave };
}
