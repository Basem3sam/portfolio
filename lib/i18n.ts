import ar from "@/lib/dictionaries/ar";
import en, { type Dictionary } from "@/lib/dictionaries/en";

export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** True for the home route in either URL form (`/` or `/ar`; `/en` is rewritten to `/`). */
export function isHomePath(pathname: string, locale: Locale) {
  return pathname === "/" || pathname === `/${locale}`;
}

/**
 * The same page in the other language. The switcher used to point at the other
 * language's home no matter where you were, so flipping language on a case
 * study threw you off it. English lives at `/…`, Arabic at `/ar/…`.
 */
export function switchLocalePath(pathname: string, locale: Locale) {
  const bare = pathname.replace(/^\/(en|ar)(?=\/|$)/, "") || "/";
  if (locale === "en") return bare === "/" ? "/ar" : `/ar${bare}`;
  return bare;
}

export function getDirection(locale: Locale) {
  return locale === "ar" ? "rtl" : "ltr";
}
