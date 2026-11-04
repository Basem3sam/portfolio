/**
 * New copy for the redesigned /links page (mockup lines 2804–2837).
 *
 * Only strings that do NOT already exist in lib/dictionaries/{en,ar}.ts live
 * here — the page merges these over `getDictionary(locale).links` (name, role,
 * location, backToPortfolio and every row title/description are reused from
 * there). lib/i18n.ts stays untouched; this module is imported only by the
 * links page. Arabic matches the mockup's data-ar copy exactly.
 */

export type LinksPageStrings = {
  /** Availability chip on the profile card. */
  chip: string;
  groupStart: string;
  groupReach: string;
  groupCode: string;
  /** Accessible names for the copy buttons on the phone and email rows. */
  copyEmail: string;
  copyPhone: string;
  /** Tooltip text before and after a successful copy. */
  copyTip: string;
  copied: string;
};

export const linksPageStrings: Record<"en" | "ar", LinksPageStrings> = {
  en: {
    chip: "Open to internships & freelance",
    groupStart: "Start here",
    groupReach: "Reach me",
    groupCode: "Code & work",
    copyEmail: "Copy email address",
    copyPhone: "Copy phone number",
    copyTip: "Copy",
    copied: "Copied",
  },
  ar: {
    chip: "متاح للتدريب والعمل الحر",
    groupStart: "ابدأ من هنا",
    groupReach: "تواصل معي",
    groupCode: "الكود والأعمال",
    copyEmail: "نسخ البريد الإلكتروني",
    copyPhone: "نسخ رقم الهاتف",
    copyTip: "نسخ",
    copied: "تم النسخ",
  },
};
