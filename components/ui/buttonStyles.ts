type Variant = "primary" | "outlinePrimary" | "light" | "outlineLight";
type Size = "md" | "lg" | "card" | "cardSm";

const base =
  "relative z-[1] inline-flex cursor-pointer items-center justify-center overflow-hidden text-center align-middle leading-normal no-underline select-none hover:-translate-y-0.5 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 before:absolute before:inset-0 before:z-[-1] before:origin-left before:scale-x-0 before:rounded-[inherit] before:transition-transform before:duration-300 before:content-[''] hover:before:scale-x-100";

const variants: Record<Variant, string> = {
  primary:
    "border border-secondary bg-secondary font-semibold text-white shadow-[0_2px_4px_rgba(52,152,219,0.2)] transition-all duration-300 hover:border-[#2980b9] hover:bg-[#2980b9] hover:shadow-[0_8px_20px_rgba(52,152,219,0.4)] before:bg-white/15",
  outlinePrimary:
    "border-2 border-secondary bg-transparent font-semibold text-secondary transition-all duration-300 hover:bg-secondary hover:text-white hover:shadow-[0_8px_20px_rgba(52,152,219,0.4)] before:bg-secondary/10",
  light:
    "border border-[#f8f9fa] bg-[#f8f9fa] font-normal text-black transition-[color,background-color,border-color,box-shadow] duration-150 ease-in-out hover:border-[#c6c7c8] hover:bg-[#d3d4d5] hover:shadow-[0_10px_25px_rgba(0,0,0,0.2)] before:bg-black/5 dark:border-[#4b5563] dark:bg-[#374151] dark:text-dark-text dark:hover:bg-[#4b5563]",
  outlineLight:
    "border border-[#f8f9fa] bg-transparent font-normal text-[#f8f9fa] transition-[color,background-color,border-color,box-shadow] duration-150 ease-in-out hover:bg-[#f8f9fa] hover:text-black hover:shadow-[0_8px_20px_rgba(52,152,219,0.4)] before:bg-white/10",
};

const sizes: Record<Size, string> = {
  md: "rounded-md px-3 py-1.5 text-[1rem] max-md:px-6 max-md:py-2.5 max-md:text-[0.95rem] max-sm:px-5 max-sm:text-[0.9rem]",
  lg: "rounded-[50px] px-8 py-3 text-[1.1rem] max-md:px-6 max-md:py-2.5 max-md:text-[0.95rem] max-sm:px-5 max-sm:text-[0.9rem] max-xs:px-[18px] max-xs:text-[0.85rem]",
  card: "rounded-md px-3 py-1.5 text-[1rem] max-md:px-6 max-md:py-2.5 max-md:text-[0.95rem] sm:max-md:px-4 sm:max-md:text-[0.9rem] max-sm:px-4 max-sm:text-[0.9rem]",
  cardSm:
    "rounded-sm px-2 py-1 text-[0.875rem] max-md:px-6 max-md:py-2.5 max-md:text-[0.95rem] sm:max-md:px-4 sm:max-md:text-[0.9rem] max-sm:px-4 max-sm:text-[0.9rem]",
};

const groupItem = "max-sm:w-full max-sm:min-w-0 max-sm:whitespace-normal";

export function buttonGroupClass(single: boolean) {
  return `mt-auto flex w-full flex-wrap items-stretch gap-3 max-sm:flex-col max-sm:gap-2 ${single ? "" : "justify-between"}`;
}

export function buttonGroupItemClass(single: boolean) {
  return single
    ? `w-full max-sm:min-h-11 ${groupItem}`
    : `min-h-12 min-w-[140px] flex-1 whitespace-nowrap ${groupItem}`;
}

export function buttonStyles(variant: Variant, size: Size = "md") {
  return `${base} ${variants[variant]} ${sizes[size]}`;
}
