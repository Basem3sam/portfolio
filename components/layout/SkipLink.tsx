export default function SkipLink({ label = "Skip to main content" }: { label?: string }) {
  return (
    <a
      href="#main-content"
      className="absolute start-0 top-[-100%] z-[1070] rounded-ee-md bg-secondary px-4 py-3 font-semibold text-on-secondary no-underline transition-[top] duration-300 focus:top-0 focus:outline-3 focus:outline-offset-2 focus:outline-secondary print:hidden"
    >
      {label}
    </a>
  );
}
