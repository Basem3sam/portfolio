export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="absolute top-[-100%] left-0 z-[1070] rounded-br-md bg-secondary px-4 py-3 font-semibold text-white no-underline transition-[top] duration-300 focus:top-0 focus:outline-3 focus:outline-offset-2 focus:outline-accent print:hidden"
    >
      Skip to main content
    </a>
  );
}
