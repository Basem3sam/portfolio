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

/** The photo-hunt hint ladder. Every line describes something the person can
    SEE the portrait do, in the order it does it. None names the code: the
    terminal asks for the same habit (read what is on screen, then act). */
export const HINT_LEVELS: HintLevel[] = [
  { tooltip: { en: "...", ar: "..." }, notification: { en: "", ar: "" }, icon: "helpCircle", showNotification: false },
  {
    tooltip: { en: "It reacts. Watch which way it moves.", ar: "إنه يتفاعل. راقب اتجاه حركته." },
    notification: {
      en: "It reacted. Click again and watch which way it moves.",
      ar: "تفاعلت الصورة. اضغط مجددًا وراقب اتجاه حركتها.",
    },
    icon: "eye",
    showNotification: true,
  },
  {
    tooltip: { en: "Up, up. Then the opposite, twice.", ar: "لأعلى مرتين. ثم العكس مرتين." },
    notification: {
      en: "Two bounces up, then two down. The order matters.",
      ar: "نطّتان لأعلى ثم نطّتان لأسفل. الترتيب مهم.",
    },
    icon: "gamepad",
    showNotification: true,
  },
  {
    tooltip: { en: "Now it slides: left, right, left, right.", ar: "الآن تنزلق: يسار، يمين، يسار، يمين." },
    notification: {
      en: "Now it slides sideways, one way and back, twice.",
      ar: "الآن تنزلق جانبيًا، ذهابًا وإيابًا، مرتين.",
    },
    icon: "gamepad",
    showNotification: true,
  },
  {
    tooltip: { en: "Eight moves, then a flash. One more flash.", ar: "ثماني حركات ثم وميض. بقي وميض واحد." },
    notification: {
      en: "That was a flash, not a move. One more is coming.",
      ar: "كان ذلك وميضًا وليس حركة. بقي وميض آخر.",
    },
    icon: "gamepad",
    showNotification: true,
  },
  {
    tooltip: { en: "One flash left, then you have all ten.", ar: "بقي وميض واحد ثم تكتمل العشر." },
    notification: {
      en: "One more click. Then you will have seen all ten.",
      ar: "نقرة أخيرة. وبعدها تكون قد رأيت الحركات العشر.",
    },
    icon: "trophy",
    showNotification: true,
  },
];

/** Feedback after a wrong keypad attempt. It describes the portrait, never
    the code, and gets more concrete each time. */
export const FAIL_HINTS: Localised[] = [
  {
    en: "Not quite. The portrait performed it, move by move.",
    ar: "ليس تمامًا. الصورة أدّتها حركةً بحركة.",
  },
  { en: "The order is the order it moved in.", ar: "الترتيب هو ترتيب حركتها." },
  {
    en: "Eight moves, then two flashes. Click it and watch.",
    ar: "ثماني حركات ثم وميضان. اضغط عليها وراقب.",
  },
];

/** Reminder pings while the clue button is open. */
export const REMINDERS: Localised[] = [
  { en: "Watch which way the portrait moves.", ar: "راقب اتجاه حركة الصورة." },
  { en: "Ten clicks, ten moves, in order.", ar: "عشر نقرات، عشر حركات، بالترتيب." },
  { en: "The keypad has the same buttons you saw.", ar: "لوحة المفاتيح فيها الأزرار نفسها التي رأيتها." },
  { en: "Eight moves, then two flashes.", ar: "ثماني حركات ثم وميضان." },
  { en: "No keyboard? Ctrl + Shift + B opens the keypad.", ar: "بلا لوحة مفاتيح؟ Ctrl + Shift + B يفتح لوحة المفاتيح." },
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
