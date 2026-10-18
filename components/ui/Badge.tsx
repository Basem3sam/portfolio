import type { ReactNode } from "react";

export default function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-md border border-note/30 bg-note/10 px-3 py-1 text-sm font-medium text-note">
      {children}
    </span>
  );
}
