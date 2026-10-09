import type { ReactNode } from "react";

type OverlayShellProps = {
  icon: string;
  title: string;
  visible: boolean;
  containerVisible: boolean;
  onClose: () => void;
  background: ReactNode;
  children: ReactNode;
};

export default function OverlayShell({
  icon,
  title,
  visible,
  containerVisible,
  onClose,
  background,
  children,
}: OverlayShellProps) {
  return (
    <div
      dir="ltr"
      className={`fixed inset-0 z-[10005] flex items-center justify-center overflow-y-auto bg-[rgba(10,8,5,0.97)] p-3 backdrop-blur-[20px] transition-opacity duration-[400ms] sm:p-5 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`relative flex max-h-[calc(100dvh_-_1.5rem)] w-full max-w-[420px] flex-col overflow-hidden rounded-[20px] border-2 border-[#fbbf24] bg-[linear-gradient(135deg,#14110a_0%,#0b0906_100%)] font-mono text-white shadow-[0_0_60px_rgba(251,191,36,0.25),inset_0_0_60px_rgba(251,191,36,0.04)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] sm:max-h-[calc(100dvh_-_2.5rem)] ${
          containerVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-90 opacity-0"
        }`}
      >
        <div className="relative z-[1] shrink-0 overflow-hidden border-b-2 border-[rgba(251,191,36,0.3)] bg-[linear-gradient(135deg,#1a150b_0%,#0e0b07_100%)] py-4 pr-[60px] pl-5">
          <div className="absolute top-0 left-[-100%] h-full w-full animate-header-sweep bg-[linear-gradient(90deg,transparent_0%,rgba(251,191,36,0.1)_50%,transparent_100%)]"></div>
          <h3 className="relative m-0 flex max-w-[calc(100%_-_50px)] flex-wrap items-center gap-2.5 text-[15px] leading-[1.3] font-medium tracking-[1px] text-[#fbbf24] [text-shadow:0_0_10px_rgba(251,191,36,0.5)]">
            <span className="animate-icon-float text-[20px]">{icon}</span>
            <span>{title}</span>
          </h3>
          <button
            className="absolute top-1/2 right-3 z-10 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.1)] text-[22px] text-[#f87171] transition-all duration-300 active:scale-90 active:rotate-90 active:bg-[rgba(248,113,113,0.2)]"
            aria-label="Close"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="relative z-[1] min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
        {background}
      </div>
    </div>
  );
}