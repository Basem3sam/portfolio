import type { Locale } from "@/lib/i18n";

/**
 * Case-study copy for the Trosc backend page.
 *
 * The wording follows the approved reference (`Portfolio Design Mockup.html`,
 * `main[data-page="case"]`) so the rendered page matches it line for line:
 * the hero label, the seven request-path stages, the three architecture
 * entries, the five security controls, and the explorer / frontend copy are
 * transcribed from there, in both locales.
 *
 * Figures are the ones the owner confirmed (see
 * `docs/portfolio-redesign/CLAIMS-VERIFICATION.md`): 100+ endpoints, 12
 * collections, 17 services, 60+ test suites, 94.8% statement coverage, 200+
 * members. The 131 mounted endpoints figure is deliberately confined to the
 * metrics note, where the counting method is stated.
 */

export type TroscMetric = {
  label: string;
  value: number;
  /** Suffix rendered in the honey-coloured `em` (e.g. "+", "%"). */
  suffix: string;
};

export type TroscStage = {
  /** Step number shown in the node. */
  n: string;
  name: string;
  desc: string;
};

export type TroscEntry = {
  title: string;
  desc: string;
};

export type TroscDictionary = {
  metadata: {
    title: string;
    description: string;
  };
  back: {
    label: string;
  };
  hero: {
    label: string;
    title: string;
    slug: string;
    status: string;
    intro: string;
  };
  metrics: TroscMetric[];
  metricsNote: string;
  actions: {
    repository: string;
    liveSite: string;
    apiReference: string;
  };
  sections: {
    requestPath: {
      title: string;
      lead: string;
      stages: TroscStage[];
    };
    architecture: {
      title: string;
      entries: TroscEntry[];
    };
    security: {
      title: string;
      items: TroscEntry[];
      note: string;
    };
    explorer: {
      title: string;
      lead: string;
      run: string;
      /** Footnote while nothing has been simulated yet. */
      idle: string;
      /** Footnote after a simulated run. */
      note: string;
      /** Group headings in the endpoint list, by who may call them. */
      groups: { public: string; protected: string; admin: string };
      /** Labels of the response strip. */
      status: string;
      time: string;
      size: string;
      limit: string;
      /** Unit that follows the rate-limit number. */
      limitUnit: string;
      running: string;
      typical: string;
    };
    frontend: {
      title: string;
      lead: string;
      addr: string;
      placeholder: string;
      body: string;
    };
  };
};

const en: TroscDictionary = {
  metadata: {
    title: "trosc-backend — Case Study | Basem Esam",
    description:
      "How a student-club API grew into a 100+ endpoint production system serving 200+ members: service-layer architecture, policy-based authorization, MongoDB transactions, and a zero-cost media pipeline.",
  },
  back: {
    label: "Work",
  },
  hero: {
    label: "Case study · IT Head & Backend Lead · Jan 2025 – present",
    title: "Trosc backend",
    slug: "trosc-backend",
    status: "In production",
    intro:
      "The API behind Trosc Student Club's learning platform at Suez Canal University. It began in January 2025 as a club website and grew into a production system for tracks, courses, video sessions, events, announcements, assignments, weekly tasks, and reviews, on infrastructure that costs nothing to run.",
  },
  metrics: [
    { label: "endpoints", value: 100, suffix: "+" },
    { label: "collections", value: 12, suffix: "" },
    { label: "services", value: 17, suffix: "" },
    { label: "test suites", value: 60, suffix: "+" },
    { label: "statement coverage", value: 94.8, suffix: "%" },
    { label: "members", value: 200, suffix: "+" },
  ],
  metricsNote:
    "131 mounted endpoints counted from the router stack and coverage from clover.xml, both Oct 2026. Member count confirmed by the owner.",
  actions: {
    repository: "Repository",
    liveSite: "Live site",
    apiReference: "API reference",
  },
  sections: {
    requestPath: {
      title: "Request path",
      lead: "What happens to one request before it reaches the database. Simplified from the project README.",
      stages: [
        { n: "1", name: "Client", desc: "Browser or app" },
        { n: "2", name: "Rate limit", desc: "300 requests / 15 min globally, 5 / 15 min on auth" },
        { n: "3", name: "Auth", desc: "Dual-token JWT: bearer header and httpOnly cookie" },
        { n: "4", name: "RBAC", desc: "Student, instructor, admin" },
        {
          n: "5",
          name: "Policy",
          desc: "Current role and staff membership, never who created the item",
        },
        { n: "6", name: "Service", desc: "17 services behind thin controllers" },
        { n: "7", name: "MongoDB", desc: "12 collections, 10 s query deadline" },
      ],
    },
    architecture: {
      title: "Architecture",
      entries: [
        {
          title: "Thin controllers, one home per rule",
          desc: "All business logic lives in 17 services, so a change in enrollment policy happens in exactly one file.",
        },
        {
          title: "Authorization from current facts",
          desc: "Every mutation is authorized from the caller's current role and staff membership, never from who created the item. Drafts return a 404, not a redacted response.",
        },
        {
          title: "One query class",
          desc: "Every list endpoint runs through APIFeatures: 8 MongoDB operators, sorting, field selection, pagination metadata, and full-text search.",
        },
      ],
    },
    security: {
      title: "13 documented security controls",
      items: [
        { title: "Helmet", desc: "HTTP security headers." },
        {
          title: "express-mongo-sanitize · HPP",
          desc: "Query sanitizing and parameter-pollution protection.",
        },
        { title: "CORS whitelist", desc: "Named origins only." },
        { title: "Tiered rate limiting", desc: "Tighter limits on auth endpoints." },
        {
          title: "Dual-token JWT + 3-tier RBAC",
          desc: "Enforced by the policy layer on every request.",
        },
      ],
      note: "The repository README documents 13 controls in total. Seven are covered by the five entries above.",
    },
    explorer: {
      title: "Endpoint explorer",
      lead: "14 of the 100+ endpoints, grouped by who may call them. Responses are simulated on this page and no request is sent.",
      run: "Run",
      idle: "simulated · idle · pick an endpoint and press Run",
      note: "simulated · no request sent",
      groups: { public: "Public", protected: "Signed in", admin: "Admin only" },
      status: "Status",
      time: "Response time",
      size: "Payload",
      limit: "Rate limit",
      limitUnit: "req / 15 min",
      running: "Running…",
      typical: "typical",
    },
    frontend: {
      title: "The frontend",
      lead: "The API runs behind a live web app used by club members.",
      addr: "trosc.vercel.app",
      placeholder: "placeholder · supply a real capture",
      body: "Screenshot of trosc.vercel.app goes here. Same plate frame, hairline border, no shadow.",
    },
  },
};

const ar: TroscDictionary = {
  metadata: {
    title: "trosc-backend — دراسة حالة | باسم عصام",
    description:
      "كيف نما API لنادٍ طلابي إلى نظام إنتاجي بأكثر من 100 نقطة نهاية يخدم أكثر من 200 عضو: معمارية بطبقة خدمات، وتحكّم بالصلاحيات عبر طبقة سياسات، ومعاملات MongoDB، وخط وسائط بلا تكلفة.",
  },
  back: {
    label: "الأعمال",
  },
  hero: {
    label: "دراسة حالة · رئيس قسم IT وقائد فريق Backend · يناير 2025 – حتى الآن",
    title: "الواجهة الخلفية لـ Trosc",
    slug: "trosc-backend",
    status: "قيد الإنتاج",
    intro:
      "الواجهة البرمجية خلف منصة التعلّم لنادي Trosc الطلابي في جامعة قناة السويس. بدأت في يناير 2025 كموقع للنادي ثم تحوّلت إلى نظام إنتاجي للمسارات والدورات والجلسات المرئية والفعاليات والإعلانات والواجبات والمهام الأسبوعية والتقييمات، على بنية تحتية لا تكلّف شيئًا في تشغيلها.",
  },
  metrics: [
    { label: "نقطة نهاية", value: 100, suffix: "+" },
    { label: "مجموعة بيانات", value: 12, suffix: "" },
    { label: "خدمة", value: 17, suffix: "" },
    { label: "مجموعة اختبار", value: 60, suffix: "+" },
    { label: "تغطية بيانية", value: 94.8, suffix: "%" },
    { label: "عضو مستفيد", value: 200, suffix: "+" },
  ],
  metricsNote:
    "131 نقطة نهاية مفعّلة محسوبة من مكدّس الموجّه، وتغطية الاختبارات من clover.xml، كلاهما أكتوبر 2026. عدد الأعضاء بتأكيد المالك.",
  actions: {
    repository: "المستودع",
    liveSite: "الموقع المباشر",
    apiReference: "مرجع الـ API",
  },
  sections: {
    requestPath: {
      title: "مسار الطلب",
      lead: "ما يحدث لطلب واحد قبل أن يصل إلى قاعدة البيانات. مبسّط من README المشروع.",
      stages: [
        { n: "1", name: "العميل", desc: "متصفح أو تطبيق" },
        { n: "2", name: "تحديد المعدل", desc: "300 طلب / 15 دقيقة عالميًا، و5 / 15 دقيقة للمصادقة" },
        { n: "3", name: "المصادقة", desc: "JWT مزدوج: ترويسة Bearer وكوكي httpOnly" },
        { n: "4", name: "الصلاحيات", desc: "طالب، مدرّب، مشرف" },
        {
          n: "5",
          name: "السياسات",
          desc: "الدور الحالي وعضوية الفريق، لا منشئ العنصر",
        },
        { n: "6", name: "الخدمة", desc: "17 خدمة خلف متحكمات نحيفة" },
        { n: "7", name: "MongoDB", desc: "12 مجموعة بيانات، ومهلة 10 ثوانٍ للاستعلام" },
      ],
    },
    architecture: {
      title: "المعمارية",
      entries: [
        {
          title: "متحكمات نحيفة، ومكان واحد لكل قاعدة",
          desc: "كل منطق العمل في 17 خدمة مخصّصة، فتغيير سياسة التسجيل يحدث في ملف واحد بالضبط.",
        },
        {
          title: "صلاحيات من الوقائع الحالية",
          desc: "كل عملية تعديل تُقيَّم من الدور الحالي للمستدعي وعضويته في فريق الإدارة، لا من منشئ العنصر. والمسودات تعطي 404 لا استجابة منقّحة.",
        },
        {
          title: "صنف واحد للاستعلام",
          desc: "كل نقطة نهاية للقوائم تمر عبر APIFeatures: 8 معاملات MongoDB، وترتيب، واختيار حقول، وبيانات تقسيم صفحات، وبحث نصي كامل.",
        },
      ],
    },
    security: {
      title: "13 إجراءً أمنيًا موثّقًا",
      items: [
        { title: "Helmet", desc: "ترويسات أمان HTTP." },
        {
          title: "express-mongo-sanitize · HPP",
          desc: "تنقية استعلامات MongoDB والحماية من تلوث المعاملات.",
        },
        { title: "قائمة سماح CORS", desc: "أصول محددة فقط." },
        { title: "تحديد معدل متدرّج", desc: "حدود أضيق على نقاط المصادقة." },
        {
          title: "JWT مزدوج + RBAC بثلاث مستويات",
          desc: "يُطبَّق بطبقة السياسات في كل طلب.",
        },
      ],
      note: "يوثّق README المستودع 13 إجراءً أمنيًا في المجموع، وهنا خمسة بنود تضم سبعة منها.",
    },
    explorer: {
      title: "مستكشف نقاط النهاية",
      lead: "14 نقطة نهاية من أكثر من 100، مجمّعة بحسب من يحق له استدعاؤها. الاستجابات هنا محاكاة ولا يُرسَل أي طلب فعلي.",
      run: "تشغيل",
      idle: "محاكاة · في الانتظار · اختر نقطة نهاية ثم اضغط تشغيل",
      note: "محاكاة · لم يُرسَل أي طلب",
      groups: { public: "عامة", protected: "للمسجّلين", admin: "للمشرفين فقط" },
      status: "الحالة",
      time: "زمن الاستجابة",
      size: "الحجم",
      limit: "حد الطلبات",
      limitUnit: "طلب / 15 دقيقة",
      running: "جارٍ التشغيل…",
      typical: "المعتاد",
    },
    frontend: {
      title: "الواجهة الأمامية",
      lead: "يعمل الـ API خلف تطبيق ويب حي لأعضاء النادي.",
      addr: "trosc.vercel.app",
      placeholder: "placeholder · supply a real capture",
      body: "Screenshot of trosc.vercel.app goes here. Same plate frame, hairline border, no shadow.",
    },
  },
};

export function getTroscDictionary(locale: Locale): TroscDictionary {
  return locale === "ar" ? ar : en;
}
