import type { ReactNode } from "react";

export default function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="relative mb-[50px] text-[2.5rem] leading-[1.2] font-bold tracking-[-0.5px] text-dark-text after:absolute after:bottom-[-15px] after:left-0 after:h-1 after:w-[60px] after:rounded-sm after:bg-brand-x after:content-[''] max-lg:text-[2rem] max-md:text-[1.75rem] max-sm:mb-[30px] max-sm:text-[1.5rem] max-sm:after:bottom-[-10px] max-sm:after:h-[3px] max-sm:after:w-10 max-xs:text-[1.35rem]">
      {children}
    </h2>
  );
}
