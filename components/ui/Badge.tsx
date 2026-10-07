import type { ReactNode } from 'react';

export type BadgeTone =
  | 'secondary'
  | 'primary'
  | 'warning'
  | 'warningWhite'
  | 'info'
  | 'danger'
  | 'success'
  | 'light';

type BadgeProps = {
  variant: 'primary' | 'project';
  tone?: BadgeTone;
  title?: string;
  children: ReactNode;
};

const base =
  'rounded-md text-center leading-none font-medium tracking-[0.3px] whitespace-nowrap align-baseline transition-all duration-300 hover:scale-105';

const tones: Record<BadgeTone, string> = {
  secondary: 'bg-[#6c757d] text-white',
  primary: 'bg-secondary text-on-secondary',
  warning: 'bg-[#ffc107] text-[#212529]',
  warningWhite: 'bg-[#ffc107] text-[#212529]',
  info: 'bg-[#0e7490] text-white',
  danger: 'bg-[#dc3545] text-white',
  success: 'bg-[#198754] text-white',
  light: 'bg-[#f8f9fa] text-[#212529]',
};

const variants = {
  primary:
    'mr-2 mb-2 inline-block bg-secondary px-[0.75em] py-[0.35em] text-[0.75em] text-on-secondary',
  project:
    'my-1 mr-1 inline-flex items-center justify-center px-3 py-1.5 text-[0.75rem] dark:border dark:border-[#3f434b] dark:bg-[#22262c] dark:text-[#e8e6e1]',
};

export default function Badge({
  variant,
  tone = 'secondary',
  title,
  children,
}: BadgeProps) {
  const className =
    variant === 'project'
      ? `${base} ${variants.project} ${tones[tone]}`
      : `${base} ${variants.primary}`;

  return (
    <span className={className} title={title}>
      {children}
    </span>
  );
}
