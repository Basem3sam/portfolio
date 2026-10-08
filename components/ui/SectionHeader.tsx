type SectionHeaderProps = {
  number: string;
  title: string;
};

export default function SectionHeader({ number, title }: SectionHeaderProps) {
  return (
    <div
      className="mb-10 md:mb-14 data-[revealed=false]:opacity-0 data-[revealed=true]:animate-reveal-up"
      data-reveal
    >
      <p className="font-mono text-sm font-medium text-secondary">
        <span dir="ltr">§ {number}</span>
      </p>
      <h2 className="mt-1 text-3xl font-semibold tracking-tight text-dark-text md:text-4xl">
        {title}
      </h2>
      <div className="mt-4 flex items-center gap-2" aria-hidden="true">
        <span className="h-0.5 w-12 rounded-full bg-secondary motion-safe:animate-rule-grow"></span>
        <span className="h-px flex-1 bg-hairline"></span>
      </div>
    </div>
  );
}