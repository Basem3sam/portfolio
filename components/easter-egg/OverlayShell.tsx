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
      className={`fixed inset-0 z-[10005] flex items-center justify-center overflow-y-auto bg-[rgba(0,0,0,0.97)] p-5 backdrop-blur-[20px] transition-opacity duration-[400ms] ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`relative max-h-[90vh] w-full max-w-[420px] overflow-hidden rounded-[20px] border-2 border-[#00ff41] bg-[linear-gradient(135deg,#0a0e27_0%,#050a1a_100%)] text-white shadow-[0_0_60px_rgba(0,255,65,0.3),inset_0_0_60px_rgba(0,255,65,0.05)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${containerVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-90 opacity-0"}`}
      >
        <div className="relative z-[1] overflow-hidden border-b-2 border-[rgba(0,255,65,0.3)] bg-[linear-gradient(135deg,#1a1f3a_0%,#0d1224_100%)] py-5 pr-[60px] pl-5">
          <div className="absolute top-0 left-[-100%] h-full w-full animate-header-sweep bg-[linear-gradient(90deg,transparent_0%,rgba(0,255,65,0.1)_50%,transparent_100%)]"></div>
          <h3 className="relative m-0 flex max-w-[calc(100%_-_50px)] flex-wrap items-center gap-2.5 font-[Courier_New,monospace] text-[15px] leading-[1.3] tracking-[1px] text-[#00ff41] [text-shadow:0_0_10px_rgba(0,255,65,0.5)]">
            <span className="animate-icon-float text-[20px]">{icon}</span>
            <span>{title}</span>
          </h3>
          <button
            className="absolute top-1/2 right-3 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[rgba(255,71,87,0.3)] bg-[rgba(255,71,87,0.1)] text-[22px] text-[#ff4757] transition-all duration-300 active:scale-90 active:rotate-90 active:bg-[rgba(255,71,87,0.2)]"
            aria-label="Close"
            onClick={onClose}
          >
            &times;
          </button>
        </div>
        <div className="relative z-[1] max-h-[calc(90vh_-_80px)] overflow-y-auto">{children}</div>
        {background}
      </div>
    </div>
  );
}
