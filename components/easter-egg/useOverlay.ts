import { useCallback, useEffect, useRef, useState } from "react";

/** `quick` is a hand-off from another overlay: the card is there at once and
    the backdrop dissolves instead of starting from the page again. */
export function useOverlay(quick = false) {
  const [shown, setShown] = useState(false);
  const [containerShown, setContainerShown] = useState(quick);
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    const frame = requestAnimationFrame(() => setShown(true));
    if (!quick) pending.push(window.setTimeout(() => setContainerShown(true), 100));

    return () => {
      cancelAnimationFrame(frame);
      pending.forEach((timer) => window.clearTimeout(timer));
    };
  }, [quick]);

  const leave = useCallback((callback: () => void) => {
    setLeaving(true);
    timers.current.push(window.setTimeout(callback, 300));
  }, []);

  return { visible: shown && !leaving, containerVisible: containerShown, leave };
}
