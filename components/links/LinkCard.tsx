import Link from 'next/link';

type LinkCardProps = {
  href: string;
  iconClass: string;
  icon: string;
  title: string;
  description: string;
  external?: boolean;
  download?: boolean;
};

const card =
  "group relative flex items-center gap-[15px] overflow-hidden rounded-xl border border-black/5 bg-white p-5 text-dark-text no-underline shadow-sm transition-all duration-300 hover:-translate-y-[5px] hover:border-secondary hover:shadow-xl before:absolute before:top-0 before:left-[-100%] before:h-full before:w-full before:bg-[linear-gradient(90deg,transparent,rgba(160,74,7,0.07),transparent)] before:transition-[left] before:duration-500 before:ease-[ease] before:content-[''] hover:before:left-full dark:border-[rgba(161,161,170,0.3)] dark:bg-[rgba(22,25,30,0.8)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.3)] dark:backdrop-blur-[20px] dark:before:bg-[linear-gradient(90deg,transparent,rgba(251,191,36,0.1),transparent)] dark:hover:bg-[rgba(22,25,30,0.95)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]";

export default function LinkCard({
  href,
  iconClass,
  icon,
  title,
  description,
  external,
  download,
}: LinkCardProps) {
  const content = (
    <>
      <div
        className={`flex size-[50px] shrink-0 items-center justify-center rounded-[10px] text-[1.5rem] text-white transition-all duration-300 ease-[ease] group-hover:scale-110 group-hover:rotate-[5deg] ${iconClass}`}
      >
        <i className={icon}></i>
      </div>
      <div className="flex-1">
        <div className="mb-[3px] text-[1.1rem] font-semibold">{title}</div>
        <div className="text-[0.9rem] text-light-text">{description}</div>
      </div>
      <i className="fas fa-arrow-right shrink-0 text-[1.2rem] text-secondary transition-transform duration-300 ease-[ease] group-hover:translate-x-[5px] rtl:rotate-180"></i>
    </>
  );

  if (href.startsWith('/') && !download) {
    return (
      <Link href={href} className={card}>
        {content}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={card}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      download={download}
    >
      {content}
    </a>
  );
}
