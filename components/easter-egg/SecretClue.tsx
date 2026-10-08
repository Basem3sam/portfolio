"use client";

import type { Ref } from "react";
import { HINT_LEVELS } from "@/components/easter-egg/constants";
import Icon from "@/components/ui/Icon";

type SecretClueProps = {
  buttonRef: Ref<HTMLButtonElement>;
  revealed: boolean;
  level: number;
  onActivate: () => void;
};

const tooltip =
  "pointer-events-none absolute rounded-sm border border-[#fbbf24] bg-[rgba(12,10,6,0.95)] whitespace-nowrap text-[#fbbf24] opacity-0 shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-opacity duration-300";

export default function SecretClue({ buttonRef, revealed, level, onActivate }: SecretClueProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      className={`group fixed bottom-[30px] start-[30px] z-[1000] flex size-10 items-center justify-center rounded-full bg-[#fbbf24] text-[#0c0a06] shadow-[0_0_20px_rgba(251,191,36,0.5)] transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] max-[481px]:bottom-[25px] max-[481px]:start-5 max-[481px]:size-[50px] ${revealed ? "visible scale-100 rotate-[360deg] cursor-default opacity-90 max-md:cursor-pointer max-md:active:scale-90" : "invisible scale-0 rotate-0 opacity-0"}`}
      aria-label="Secret terminal"
      onClick={onActivate}
    >
      <Icon name="terminal" className="size-[18px]" />
      <span
        className={`${tooltip} bottom-0 start-[60px] hidden px-3 py-2 text-[12px] md:block md:group-hover:opacity-100`}
        aria-hidden="true"
      >
        {HINT_LEVELS[level].tooltip}
      </span>
      <span
        className={`${tooltip} bottom-[60px] start-0 px-2.5 py-1.5 text-[11px] group-active:opacity-100 md:hidden`}
        aria-hidden="true"
      >
        ✨ Tap for secret terminal
      </span>
    </button>
  );
}