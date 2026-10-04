import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  className?: string;
  children: ReactNode;
};

export default function Section({ id, className = "", children }: SectionProps) {
  return (
    <section id={id} className={`relative w-full overflow-x-hidden py-12 ${className}`}>
      {children}
    </section>
  );
}
