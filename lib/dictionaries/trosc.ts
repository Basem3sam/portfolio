import type { Locale } from "@/lib/i18n";

const en = {
  metadata: {
    title: "trosc-backend — Case Study | Basem Esam",
    description:
      "How a student-club API grew into a 100+ endpoint production system serving 200+ members: service-layer architecture, policy-based authorization, MongoDB transactions, and a zero-cost media pipeline.",
  },
  back: "work",
  statusLabel: "production",
  role: "IT Head & Backend Lead · Jan 2025 – Present",
  brief:
    "The API behind Trosc Student Club's learning platform at Suez Canal University. What began in January 2025 as a club website grew into a production system: 100+ endpoints over 12 collections and 17 services, serving tracks, courses, video sessions, events, announcements, assignments, weekly tasks, and reviews to 200+ members — on infrastructure that costs nothing to run.",
  metricsNote: "Figures from the live API documentation.",
  links: {
    repo: "View repository",
    live: "Live site",
    api: "API reference",
  },
  metrics: [
    { value: 100, suffix: "+", label: "endpoints" },
    { value: 12, suffix: "", label: "collections" },
    { value: 17, suffix: "", label: "services" },
    { value: 60, suffix: "+", label: "test suites" },
    { value: 95, suffix: "%+", label: "statement coverage" },
    { value: 200, suffix: "+", label: "members served" },
  ],
  sections: {
    architecture: {
      title: "Architecture",
      entries: [
        {
          title: "Service layer",
          text: "Controllers stay thin; all business logic lives in 17 dedicated services. One home per rule, so a change in enrollment policy happens in exactly one file.",
        },
        {
          title: "Policy-based authorization",
          text: "Every mutation is authorized from the caller's current role and current staff membership — never from who created the item; createdBy is attribution only. Drafts (published: false) are invisible to anyone who doesn't manage them: a 404, not a redacted response.",
        },
        {
          title: "Cascade enrollment, transactional",
          text: "A dedicated service keeps User, Track, Course, and Session enrollments in sync inside MongoDB transactions, so join, leave, and approve operations can never leave a dangling reference — even under concurrency.",
        },
        {
          title: "Resource-type factories",
          text: "Reviews and assignments attach to three parent types with identical rules. A single route factory is mounted per parent, so the logic is written once and behaves the same everywhere.",
        },
        {
          title: "One query builder",
          text: "Every list endpoint runs through APIFeatures: 8 MongoDB operators, sorting, field selection, pagination metadata, and full-text search — one class, one behavior.",
        },
        {
          title: "Counted by the database",
          text: "Rosters are answered with projection-only aggregations — studentCount, isEnrolled, submissionCount — instead of loading whole arrays and deleting them before responding.",
        },
        {
          title: "Live vs. snapshot analytics",
          text: "The same computation powers the never-persisted /dashboard-stats/live and the upserted daily, weekly, and monthly snapshots behind the trend charts.",
        },
      ],
    },
    security: {
      title: "Security — seven layers",
      intro: "Defense in depth, each layer independent:",
      layers: [
        "Helmet — secure HTTP headers (CSP, HSTS, X-Frame-Options).",
        "express-mongo-sanitize — strips $ and . from user input (NoSQL injection).",
        "HPP — parameter-pollution protection with per-route whitelists.",
        "CORS whitelisting — credentials only from known origins.",
        "Tiered rate limiting — 300 requests / 15 min globally; 5 / 15 min on auth endpoints.",
        "Dual-token JWT — httpOnly secure cookie + bearer header, rememberMe lifetimes, invalidation on password change.",
        "3-tier RBAC — student / instructor / admin, enforced by the policy layer on every request.",
      ],
      extra:
        "Beyond the seven: Joi validation co-located with Swagger docs, sensitive fields stripped from request bodies to block privilege escalation, audit writes that are internal-only and never fail a request, and 10-second deadlines on every list query.",
    },
    media: {
      title: "Zero-cost media",
      paragraphs: [
        "No file uploads, anywhere. Images, videos, and PDFs are referenced by URL from 11 trusted hosts — YouTube, Google Drive, Cloudinary, Imgur, GitHub, Dropbox, and more — validated at both the Joi and Mongoose layers from a single allowlist.",
        "Assignment submissions follow the same rule: a submission is an HTTPS link, and multipart uploads are rejected with the full list of allowed hosts. The allowlist itself is served by the API at GET /v1/config/trusted-hosts, so the frontend can warn before submitting.",
        "The payoff: a stateless server with zero storage cost that scales horizontally by adding instances.",
      ],
    },
    operations: {
      title: "Operations",
      entries: [
        {
          title: "Email in the background",
          text: "Welcome, enrollment, and contact notifications are sent after the response; a failed send is logged, never thrown. Password reset is the one exception — it waits.",
        },
        {
          title: "Audit trail with retention",
          text: "Activity logs are written as a side effect of real actions — there is deliberately no public POST — and pruned automatically after 180 days.",
        },
        {
          title: "Query deadlines",
          text: "List endpoints abort database work after 10 seconds; a slow query can't hold the pool hostage.",
        },
        {
          title: "Observability",
          text: "Winston logging with rotation, a /metrics endpoint behind a bearer token, and health checks for server and database.",
        },
      ],
    },
    testing: {
      title: "Testing & CI",
      paragraphs: [
        "The suite runs against an in-memory MongoDB replica set — a real MongoDB, not a mock — so the transaction paths in the cascade service are genuinely exercised on every run.",
        "60+ suites cover auth (including cookie lifetimes and user-enumeration protection), enrollment rules, draft visibility, ownership and role gating, error mapping, and the analytics period math. Email is mocked globally; no test ever touches SMTP.",
        "CI runs the linter with a zero-warning policy and the full suite on every push.",
      ],
      stats: [
        { value: "60+", label: "suites" },
        { value: "95%+", label: "statements" },
        { value: "98%+", label: "functions" },
      ],
    },
    explorer: {
      title: "Try the API",
      subtitle:
        "A curated slice of the 100+ endpoints — select one, run it, and inspect the response.",
      run: "Run",
      running: "running",
      ok: "OK",
      simulatedNote:
        "Responses are mocked from the API documentation. The live API requires authentication and is rate-limited.",
      apiReference: "Full API reference",
      access: {
        public: "public",
        protected: "protected · JWT",
        admin: "admin / staff",
      },
      endpoints: {
        health: "Server and database health check.",
        login:
          "Authenticate with email + password; returns a JWT and sets an httpOnly cookie. rememberMe extends both to ~30 days.",
        me: "Current user profile, including pendingTrack — a pending enrollment request, computed live.",
        tracks:
          "The list-endpoint envelope: filtering, sorting, field selection, pagination metadata, full-text search.",
        popular: "Most-enrolled tracks, ordered by studentCount.",
        enroll: "Self-enroll in a track — the request goes to the track staff for approval.",
        session:
          "Session detail with the caller's own progress; media URLs stripped for non-enrolled callers.",
        progress: "Mark a session as watched — per-student, idempotent.",
        submit:
          "Submit an assignment as an HTTPS link from a trusted host; resubmitting clears the old grade.",
        grade: "Grade a submission (0–100) with optional written feedback.",
        trustedHosts: "The single source of truth for every allowed media host.",
        feed: "The dashboard feed: pinned announcements plus upcoming events.",
        liveStats: "Admin-only platform stats, computed on demand — never persisted.",
        activityMe: "The caller's own activity timeline, newest first.",
      },
    },
  },
};

export type TroscDictionary = typeof en;

const ar: TroscDictionary = {
  metadata: {
    title: "trosc-backend — دراسة حالة | باسم عصام",
    description:
      "كيف نما API لنادٍ طلابي إلى نظام إنتاجي بأكثر من 100 نقطة نهاية يخدم أكثر من 200 عضو: معمارية بطبقة خدمات، وتحكّم بالصلاحيات عبر طبقة سياسات، ومعاملات MongoDB، وخط وسائط بلا تكلفة.",
  },
  back: "أعمالي",
  statusLabel: "إنتاج",
  role: "رئيس قسم IT وقائد فريق Backend · يناير 2025 – حتى الآن",
  brief:
    "الواجهة البرمجية خلف منصة التعلّم لنادي طلاب Trosc بجامعة قناة السويس. ما بدأ في يناير 2025 كموقع لنادٍ طلابي تحوّل إلى نظام إنتاجي: أكثر من 100 نقطة نهاية فوق 12 مجموعة بيانات و17 خدمة، تخدم المسارات والدورات والجلسات المرئية والفعاليات والإعلانات والواجبات والمهام الأسبوعية والتقييمات لأكثر من 200 عضو — على بنية تحتية لا تكلّف شيئًا في تشغيلها.",
  metricsNote: "الأرقام من وثائق الـ API الحية.",
  links: {
    repo: "عرض المستودع",
    live: "الموقع الحيّ",
    api: "مرجع الـ API",
  },
  metrics: [
    { value: 100, suffix: "+", label: "نقطة نهاية" },
    { value: 12, suffix: "", label: "مجموعة بيانات" },
    { value: 17, suffix: "", label: "خدمة" },
    { value: 60, suffix: "+", label: "حزمة اختبارات" },
    { value: 95, suffix: "%+", label: "تغطية السطور" },
    { value: 200, suffix: "+", label: "عضو مستفيد" },
  ],
  sections: {
    architecture: {
      title: "المعمارية",
      entries: [
        {
          title: "طبقة الخدمات",
          text: "المتحكمات تبقى نحيفة؛ كل منطق العمل في 17 خدمة مخصّصة. قاعدة واحدة لكل حكم، فتغيير سياسة التسجيل يحدث في ملف واحد بالضبط.",
        },
        {
          title: "التحكّم بالصلاحيات عبر السياسات",
          text: "كل عملية تعديل تُقيَّم من الدور الحالي للمستدعي وعضويته الحالية في فريق الإدارة — لا من منشئ العنصر أبدًا؛ createdBy للتوثيق التاريخي فقط. والمسودات (published: false) غير مرئية لمن لا يديرها: خطأ 404، لا استجابة منقّحة.",
        },
        {
          title: "تسلسل التسجيل بمعاملات",
          text: "خدمة مخصّصة تُبقي تسجيلات المستخدم والمسار والدورة والجلسة متزامنة داخل معاملات MongoDB، فلا يمكن لعمليات الانضمام والمغادرة والموافقة أن تترك مرجعًا معلّقًا — حتى مع التزامن.",
        },
        {
          title: "مصانع أنواع الموارد",
          text: "التقييمات والواجبات ترتبط بثلاثة أنواع أم بالقواعد نفسها. مصنع مسارات واحد يُركَّب لكل نوع أب، فتُكتب المنطق مرة واحدة وتتصرف بالمثل في كل مكان.",
        },
        {
          title: "مُنشئ استعلامات واحد",
          text: "كل نقطة نهاية للقوائم تمر عبر APIFeatures: 8 معاملات MongoDB، وترتيب، واختيار حقول، وبيانات تقسيم صفحات، وبحث نصي كامل — صنف واحد، سلوك واحد.",
        },
        {
          title: "العدّ من قاعدة البيانات",
          text: "قوائم الطلاب تُجاب بتجميعات إسقاطية فقط — studentCount و isEnrolled و submissionCount — بدل تحميل المصفوفات كاملة ثم حذفها قبل الرد.",
        },
        {
          title: "تحليلات حية مقابل لقطات",
          text: "نفس الحساب يشغّل /dashboard-stats/live (لا يُخزَّن أبدًا) واللقطات اليومية والأسبوعية والشهرية القابلة للتحديث خلف رسوم الاتجاهات.",
        },
      ],
    },
    security: {
      title: "الأمان — سبع طبقات",
      intro: "دفاع في العمق، كل طبقة مستقلة:",
      layers: [
        "Helmet — ترويسات HTTP آمنة (CSP و HSTS و X-Frame-Options).",
        "express-mongo-sanitize — يحذف $ و . من مدخلات المستخدم (حقن NoSQL).",
        "HPP — حماية من تلوث المعاملات مع قوائم سماح لكل مسار.",
        "قوائم CORS — بيانات الاعتماد من أصول معروفة فقط.",
        "تحديد معدل متدرّج — 300 طلب / 15 دقيقة عالميًا؛ 5 / 15 دقيقة لنقاط المصادقة.",
        "JWT ثنائي — كوكي httpOnly آمن + ترويسة Bearer، مع أعمار rememberMe وإبطال عند تغيير كلمة المرور.",
        "RBAC بثلاثة مستويات — طالب / مدرّس / مشرف، تفرضه طبقة السياسات في كل طلب.",
      ],
      extra:
        "وراء السبع: تحقق Joi مُجاور لوثائق Swagger، وحذف الحقول الحساسة من أجسام الطلبات لمنع تصعيد الصلاحيات، وكتابات تدقيق داخلية لا تفشل طلبًا أبدًا، ومهلة 10 ثوانٍ لكل استعلام قوائم.",
    },
    media: {
      title: "وسائط بلا تكلفة",
      paragraphs: [
        "لا رفع ملفات، في أي مكان. الصور والفيديوهات وملفات PDF تُشار بروابط من 11 مضيفًا موثوقًا — YouTube و Google Drive و Cloudinary و Imgur و GitHub و Dropbox وغيرها — ويُتحقق منها على مستويي Joi و Mongoose من قائمة سماح واحدة.",
        "تسليمات الواجبات تتبع القاعدة نفسها: التسليم رابط HTTPS، ورفوع multipart تُرفض مع قائمة المضيفات المسموحة كاملة. القائمة نفسها تقدّمها الـ API على GET /v1/config/trusted-hosts ليحذّر الواجهة قبل الإرسال.",
        "الحصيلة: خادم عديم الحالة بلا تكلفة تخزين يتوسّع أفقيًا بإضافة نسخ.",
      ],
    },
    operations: {
      title: "التشغيل",
      entries: [
        {
          title: "البريد في الخلفية",
          text: "رسائل الترحيب والتسجيل والتواصل تُرسل بعد الاستجابة؛ الإرسال الفاشل يُسجَّل ولا يُرمى. إعادة تعيين كلمة المرور هي الاستثناء الوحيد — تنتظر.",
        },
        {
          title: "سجل تدقيق بمدة احتفاظ",
          text: "سجلات النشاط تُكتب كأثر جانبي لأفعال حقيقية — لا توجد POST عامة عمدًا — وتُقلَّم تلقائيًا بعد 180 يومًا.",
        },
        {
          title: "مُهَل الاستعلامات",
          text: "نقاط القوائم تُجهض عمل قاعدة البيانات بعد 10 ثوانٍ؛ الاستعلام البطيء لا يحتجز الـ pool.",
        },
        {
          title: "المراقبة",
          text: "تسجيل Winston مع تدوير، ونقطة /metrics خلف Bearer token، وفحوص صحة للخادم وقاعدة البيانات.",
        },
      ],
    },
    testing: {
      title: "الاختبارات والتكامل المستمر",
      paragraphs: [
        "الحزمة تعمل ضد مجموعة MongoDB في الذاكرة — MongoDB حقيقية لا محاكاة — فتُختبر مسارات المعاملات في خدمة التسلسل فعليًا في كل تشغيل.",
        "أكثر من 60 حزمة تغطي المصادقة (بما فيها أعمار الكوكيز والحماية من تعداد المستخدمين)، وقواعد التسجيل، ورؤية المسودات، وبوابات الملكية والأدوار، وربط الأخطاء، وحسابات فترات التحليلات. البريد يُحاكى عالميًا؛ لا اختبار يلمس SMTP.",
        "التكامل المستمر يشغّل الـ linter بسياسة صفر تحذير والحزمة كاملة مع كل دفعة.",
      ],
      stats: [
        { value: "60+", label: "حزمة" },
        { value: "95%+", label: "سطور" },
        { value: "98%+", label: "دوال" },
      ],
    },
    explorer: {
      title: "جرّب الـ API",
      subtitle: "شريحة مختارة من أكثر من 100 نقطة نهاية — اختر واحدة، شغّلها، وافحص الاستجابة.",
      run: "تشغيل",
      running: "جارٍ التنفيذ",
      ok: "OK",
      simulatedNote:
        "الاستجابات محاكاة من وثائق الـ API — الـ API الحقيقية تتطلب مصادقة وتحدّ من معدل الطلبات.",
      apiReference: "مرجع الـ API الكامل",
      access: {
        public: "عام",
        protected: "محمي · JWT",
        admin: "مشرف / إدارة",
      },
      endpoints: {
        health: "فحص صحة الخادم وقاعدة البيانات.",
        login:
          "المصادقة بالبريد وكلمة المرور؛ تُعيد JWT وتضبط كوكي httpOnly. rememberMe يمدّ الاثنين إلى ~30 يومًا.",
        me: "ملف المستخدم الحالي، بما فيه pendingTrack — طلب تسجيل معلّق يُحسب لحظيًا.",
        tracks:
          "غلاف نقاط النهاية للقوائم: تصفية وترتيب واختيار حقول وبيانات تقسيم صفحات وبحث نصي كامل.",
        popular: "المسارات الأكثر تسجيلًا، مرتّبة بـ studentCount.",
        enroll: "تسجيل ذاتي في مسار — يذهب الطلب لفريق المسار للموافقة.",
        session:
          "تفاصيل الجلسة مع تقدّم المستدعي نفسه؛ روابط الوسائط تُحجب عن غير المسجّلين.",
        progress: "وضع علامة مشاهدة على الجلسة — لكل طالب، وتكرارها آمن.",
        submit:
          "تسليم واجب كرابط HTTPS من مضيف موثوق؛ إعادة التسليم تمحو الدرجة القديمة.",
        grade: "تصحيح تسليم (0–100) مع ملاحظة مكتوبة اختيارية.",
        trustedHosts: "مصدر الحقيقة الوحيد لكل مضيف وسائط مسموح.",
        feed: "لوحة البداية: إعلانات مثبتة وفعاليات قادمة.",
        liveStats: "إحصاءات المنصة للمشرفين فقط، تُحسب عند الطلب — ولا تُخزَّن أبدًا.",
        activityMe: "الخط الزمني لنشاط المستدعي، الأحدث أولًا.",
      },
    },
  },
};

export function getTroscDictionary(locale: Locale): TroscDictionary {
  return locale === "ar" ? ar : en;
}