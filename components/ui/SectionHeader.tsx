type SectionHeaderProps = {
  number: string;
  title: string;
};

export default function SectionHeader({ number, title }: SectionHeaderProps) {
  return (
    <div className="mb-10 md:mb-14">
      <p className="font-mono text-sm font-medium text-secondary">
        <span dir="ltr">§ {number}</span>
      </p>
      <h2 className="mt-1 text-3xl font-semibold tracking-tight text-dark-text md:text-4xl">
        {title}
      </h2>
      <div className="mt-4 h-px w-full bg-hairline" aria-hidden="true"></div>
    </div>
  );
}