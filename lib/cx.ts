/**
 * Joins class names, skipping falsy values.
 *
 * Use this instead of `` `base${cond ? " extra" : ""}` `` inside className.
 * prettier-plugin-tailwindcss treats the string literals in a className
 * template as class lists and trims their whitespace, which silently turned
 * `" show"` into `"show"` and glued it onto the previous class (`dimshow`).
 * Single-word strings have no whitespace for it to trim.
 */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
