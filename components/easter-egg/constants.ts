import type { IconName } from "@/components/ui/Icon";
import type { Locale } from "@/lib/i18n";

export type TerminalMode = "terminal" | "prompt" | null;

export const KONAMI_CODE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/** Display labels for the sequence keys (slots, keycaps, aria-labels). */
export const KEY_LABEL: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  b: "B",
  a: "A",
};

/** Screen-reader names for the keypad keys (mockup `aria-label`). */
export const KEY_NAME: Record<string, string> = {
  ArrowUp: "Up",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  b: "B",
  a: "A",
};

export const CLICKS_NEEDED = 10;
export const CLUE_START_CLICK = 3;
export const CLUE_LINGER_MS = 30000;

export const isMobileViewport = () => window.innerWidth <= 768;

export function getHintLevel(clicks: number) {
  if (clicks <= 2) return 0;
  if (clicks <= 4) return 1;
  if (clicks <= 6) return 2;
  if (clicks <= 8) return 3;
  if (clicks === 9) return 4;
  return 5;
}

type Localised = { en: string; ar: string };

type HintLevel = {
  /** Clue-menu tooltip. */
  tooltip: Localised;
  /** Toast body. */
  notification: Localised;
  icon: IconName;
  showNotification: boolean;
};

/** The photo-hunt hint ladder (mockup HINTS, line 4583). */
export const HINT_LEVELS: HintLevel[] = [
  { tooltip: { en: "...", ar: "..." }, notification: { en: "", ar: "" }, icon: "helpCircle", showNotification: false },
  {
    tooltip: { en: "You found something! Keep exploring…", ar: "اكتشفتَ شيئًا! واصل الاستكشاف…" },
    notification: {
      en: "Secret discovered! Keep clicking to reveal more…",
      ar: "اكتشفتَ سرًا! واصل الضغط لتعرف المزيد…",
    },
    icon: "eye",
    showNotification: true,
  },
  {
    tooltip: { en: "Follow the arrow patterns…", ar: "اتبع نمط الأسهم…" },
    notification: {
      en: "Notice the arrow directions? There's a pattern…",
      ar: "هل لاحظتَ اتجاه الأسهم؟ هناك نمط…",
    },
    icon: "gamepad",
    showNotification: true,
  },
  {
    tooltip: { en: "Up, up, down, down…", ar: "أعلى، أعلى، أسفل، أسفل…" },
    notification: {
      en: "It's a famous gaming sequence! Keep going…",
      ar: "إنه تسلسل شهير في الألعاب! أكمل…",
    },
    icon: "gamepad",
    showNotification: true,
  },
  {
    tooltip: { en: "↑↑↓↓←→←→", ar: "↑↑↓↓←→←→" },
    notification: {
      en: "Almost there! Just need the final buttons…",
      ar: "اقتربتَ! بقيت الأزرار الأخيرة…",
    },
    icon: "gamepad",
    showNotification: true,
  },
  {
    tooltip: { en: "↑↑↓↓←→←→BA · Complete the sequence!", ar: "↑↑↓↓←→←→BA · أكمل التسلسل!" },
    notification: {
      en: "One more click! Complete the sequence.",
      ar: "نقرة أخيرة! أكمل التسلسل.",
    },
    icon: "trophy",
    showNotification: true,
  },
];

/** Gentle, escalating hints after a wrong keypad attempt (mockup `H`, 4709). */
export const FAIL_HINTS: Localised[] = [
  {
    en: "Not quite. The clues are on the page itself.",
    ar: "ليس تمامًا. التلميحات في الصفحة نفسها.",
  },
  { en: "A famous cheat code from 1986.", ar: "رمز غش شهير من عام 1986." },
  {
    en: "The portrait has been trying to tell you something.",
    ar: "الصورة كانت تحاول إخبارك بشيء.",
  },
];

/** Reminder pings while the clue button is open (mockup STR.rem, 4595). */
export const REMINDERS: Localised[] = [
  { en: "Remember the Konami code?", ar: "هل تذكر كود كونامي؟" },
  { en: "↑↑↓↓←→←→BA unlocks the terminal", ar: "↑↑↓↓←→←→BA يفتح الطرفية" },
  { en: "Some gaming history might help…", ar: "قد يساعدك القليل من تاريخ الألعاب…" },
  { en: "Arrow keys, then two letters.", ar: "أسهم، ثم حرفان." },
  { en: "Ctrl + Shift + B is for the impatient.", ar: "Ctrl + Shift + B لقليلي الصبر." },
];

/**
 * Overlay copy (mockup `I`, line 4490, and `STR`, line 4595). The egg is the
 * one bilingual surface that does not live in lib/dictionaries: it is
 * self-contained, loads only after the hunt starts, and its strings are
 * part of the behaviour contract, so they stay next to the constants.
 */
export function eggCopy(locale: Locale) {
  const ar = locale === "ar";
  const t = (en: string, alt: string) => (ar ? alt : en);

  return {
    restricted: t("Restricted", "منطقة مقيّدة"),
    pTitle: t("Access sequence required", "مطلوب تسلسل الدخول"),
    pSub: t(
      "There is a ten-key sequence that opens the developer terminal.",
      "هناك تسلسل من عشرة مفاتيح يفتح طرفية المطوّر.",
    ),
    pEnter: t("Enter the sequence", "أدخل التسلسل"),
    pCancel: t("Not now", "ليس الآن"),
    pHint: t(
      "Hint: some things on this page respond when you touch them.",
      "تلميح: بعض الأشياء في هذه الصفحة تتفاعل عندما تلمسها.",
    ),
    kTitle: t("Access sequence", "تسلسل الدخول"),
    kPh: t("Press the keys, or use your keyboard.", "اضغط المفاتيح أو استخدم لوحة المفاتيح."),
    kProgress: t("Sequence progress", "تقدّم التسلسل"),
    undo: t("Undo", "تراجع"),
    clear: t("Clear", "مسح"),
    back: t("Back", "رجوع"),
    close: t("Close", "إغلاق"),
    sound: t("Sound", "الصوت"),
    mK: t("Achievement", "إنجاز"),
    mTitle: t("Konami Code", "كود كونامي"),
    mLead: t("You found the legendary 10-click sequence.", "وجدتَ تسلسل العشر نقرات الأسطوري."),
    mSub: t(
      "This is the sequence that opens the secret terminal:",
      "هذا هو التسلسل الذي يفتح الطرفية السرية:",
    ),
    mShort: t("No keyboard? Use the shortcut", "بلا لوحة مفاتيح؟ استخدم الاختصار"),
    mBtn: t("Enter the sequence", "أدخل التسلسل"),
    mAch: t("Achievement unlocked · Terminal Explorer", "إنجاز جديد · مستكشف الطرفية"),
    ok: t("Access granted", "تم السماح بالدخول"),
    okd: t(
      "Terminal unlocked for this session. It locks again when you refresh the page.",
      "فُتحت الطرفية لهذه الجلسة، وتُقفل مجددًا عند تحديث الصفحة.",
    ),
    reset: t("Sequence broken! Start over…", "انكسر التسلسل! ابدأ من جديد…"),
    spam: t("Slow down! Enjoy the discovery process", "على مهلك! استمتع بالاستكشاف"),
  };
}

export type EggCopy = ReturnType<typeof eggCopy>;
