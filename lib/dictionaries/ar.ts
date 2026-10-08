import type { Dictionary } from "@/lib/dictionaries/en";

const ar: Dictionary = {
  metadata: {
    title: "باسم عصام | مهندس Backend",
    description:
      "باسم عصام — مهندس Backend وطالب علوم حاسب، متخصص في Node.js و Express وبناء الأنظمة القابلة للتوسع",
    keywords: "مهندس Backend, مطوّر Backend, Node.js, Express, MongoDB, تطوير الويب",
    shareDescription:
      "مهندس Backend وطالب علوم حاسب — متخصص في Node.js و Express وبناء الأنظمة القابلة للتوسع.",
  },
  nav: {
    home: "باسم عصام",
    ariaHome: "باسم عصام — الرئيسية",
    work: "أعمالي",
    stack: "التقنيات",
    about: "نبذة عني",
    experience: "الخبرة",
    education: "التعليم",
    contact: "تواصل معي",
    allLinks: "كل روابطي",
    resume: "السيرة الذاتية",
    backToTop: "العودة إلى الأعلى",
    skipToContent: "تخطَّ إلى المحتوى الرئيسي",
    toggleNavigation: "إظهار / إخفاء القائمة",
    mainNavigation: "التنقّل الرئيسي",
  },
  theme: {
    toLight: "التبديل إلى الوضع الفاتح",
    toDark: "التبديل إلى الوضع الداكن",
  },
  footer: {
    rights: "جميع الحقوق محفوظة.",
  },
  notFound: {
    label: "HTTP 404",
    title: "الصفحة غير موجودة",
    message: "هذه الصفحة غير موجودة — ربما تم نقلها أو أن العنوان غير صحيح.",
    backHome: "العودة إلى الرئيسية",
    viewLinks: "كل روابطي",
  },
  hero: {
    whoami: "$ whoami",
    name: "باسم عصام",
    lead: "مهندس Backend بنى ويشغّل API إنتاجيًا بأكثر من 85 نقطة نهاية يخدم أكثر من 200 مستخدم حقيقي — أثناء إكماله دراسة علوم الحاسب (دفعة 2027).",
    status: "متاح",
    statusDetail: "لفرص التدريب والوظائف الأولى والعمل الحر · عن بُعد حول العالم أو حضوريًا في مصر",
    metrics: [
      { value: 85, suffix: "+", label: "نقطة نهاية في الإنتاج" },
      { value: 200, suffix: "+", label: "عضو مستفيد" },
      { value: 7, suffix: "", label: "طبقات أمان" },
      { value: 11, suffix: "", label: "مضيفات وسائط موثوقة" },
    ],
    viewWork: "استعرض أعمالي",
    downloadCv: "تحميل السيرة الذاتية",
    socialsAria: "روابط التواصل",
    socials: {
      linkedin: "ملف LinkedIn",
      github: "ملف GitHub",
      email: "مراسلة باسم عصام",
      phone: "الاتصال بباسم عصام",
    },
  },
  work: {
    title: "أعمالي",
    liveLabel: "مباشر من GitHub",
    viewRepo: "عرض المستودع",
    viewLive: "الموقع الحيّ",
    caseStudy: "دراسة الحالة",
    status: {
      production: "إنتاج",
      development: "قيد التطوير",
      complete: "مكتمل",
      research: "بحثي",
      academic: "أكاديمي",
    },
    projects: [
      {
        id: "trosc",
        name: "trosc-backend",
        status: "production",
        description:
          "Backend إنتاجي مفتوح المصدر لمنصة تعليمية لنادٍ طلابي — أكثر من 85 نقطة نهاية عبر 6 نماذج Mongoose و9 خدمات مخصّصة، تخدم المسارات والدورات والجلسات والفعاليات والإعلانات لأكثر من 200 عضو. معمارية بطبقة خدمات ومتحكمات نحيفة، ووسائط factory قابلة لإعادة الاستخدام، واستعلامات MongoDB بفهارس مركّبة وpopulate افتراضي.",
        detail:
          "تحكّم بالوصول على 3 مستويات (RBAC) مع مصادقة JWT ثنائية، ومتطلبات تسجيل (عام / بالمسار فقط / خاص)، وعمليات جماعية على المستخدمين بحراسة إدارية، وخدمة بريد بـ 4 قوالب HTML — مع توثيق Swagger/OpenAPI 3.0 تفاعلي على /api-docs.",
        tech: ["Node.js", "Express", "MongoDB", "Mongoose", "JWT", "Swagger", "Joi"],
      },
      {
        id: "store-advisor",
        name: "store-advisor",
        status: "development",
        description:
          "وكيل مراقبة عبر مصادر البيانات لتجار التجارة الإلكترونية: يتصل بمتجر التاجر وحسابات إعلاناته، ويشغّل فحوصًا تربط بيانات المصدرين معًا لتكتشف مشكلات لا تراها أي لوحة مفردة، ويقيّمها بالدولار، ويشرحها بلغة واضحة — ثم يصلحها بموافقة التاجر.",
        detail:
          "ست خدمات عبر Docker Compose: واجهة NestJS API ومجدول المهام، وخدمة ذكاء اصطناعي بـ Python، ولوحة تحكم بـ Next.js، مع Postgres و Redis — و241 اختبارًا عبر الأكواد الثلاثة. القاعدة: الفحص يكتشف المشكلة، والنموذج اللغوي يشرحها — ولا يخترع رقمًا أبدًا.",
        tech: ["NestJS", "PostgreSQL", "Redis", "Python", "Next.js", "Docker"],
      },
      {
        id: "zabthalahak",
        name: "ظبطهالك",
        status: "development",
        description:
          "عمل حر لمتجر طباعة ثلاثية الأبعاد حقيقي: واجهة متجر ولوحة تحكم إدارية عربية بالكامل بتخطيط RTL — الطلبات، الطلبات المخصّصة، المخزون، الطابعات، العملاء، التقارير، وسجل التدقيق — بـ React 19 و Vite و Tailwind، فوق طبقة بيانات مهيّأة مسبقًا لواجهة الـ API القادمة.",
        detail:
          "الـ Backend (Node.js / Express / MongoDB بمعمارية modular monolith) قيد التطوير حاليًا.",
        tech: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "MongoDB"],
      },
      {
        id: "laravel",
        name: "laravel-ecommerce-app",
        status: "complete",
        description:
          "طوّرت تطبيق تجارة إلكترونية متكامل (مصادقة، لوحة تحكم إدارية، سلة شراء، إتمام الطلبات) باستخدام علاقات Eloquent ORM مع eager loading، ومعمارية MVC، والتحقق عبر Form Requests مع غُلف معاملات قاعدة البيانات.",
        detail: "",
        tech: ["PHP", "Laravel", "MySQL", "Blade"],
      },
      {
        id: "neuroscan",
        name: "neuroscan-ai",
        status: "academic",
        description:
          "خط كشف أورام الدماغ الهجين عبر أكثر من 6 نماذج مجمّعة (CNN-KNN-KMeans) مع معالجة مسبقة بـ OpenCV وتقييم بإجماع متعدد النماذج، مع زيادة للبيانات وتحقق متقاطع ومعمارية مصنّفات قابلة للتبديل لاختبارات A/B قابلة للتكرار.",
        detail: "مشروع فريق — امتحان عملي في السنة الثالثة.",
        tech: ["Python", "PyTorch", "CNN", "KNN", "KMeans", "OpenCV"],
      },
    ],
  },
  stack: {
    title: "التقنيات",
    groups: [
      {
        label: "الواجهة الخلفية وواجهات البرمجة",
        items: [
          "Node.js",
          "Express.js",
          "NestJS",
          "REST API design",
          "JWT authentication",
          "PHP",
          "Laravel",
          "JavaScript",
          "Python",
          "C++",
        ],
      },
      {
        label: "قواعد البيانات",
        items: [
          "MongoDB (Mongoose ODM)",
          "Schema design",
          "Compound & text indexing",
          "Aggregation pipelines",
          "MySQL",
          "PostgreSQL",
        ],
      },
      {
        label: "التشغيل والأدوات",
        items: [
          "Docker",
          "Git",
          "Linux",
          "Bash",
          "Nodemon",
          "ESLint (Airbnb config)",
          "Prettier",
        ],
      },
      {
        label: "الواجهة الأمامية",
        items: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
      },
      {
        label: "الأمان والتوثيق",
        items: [
          "Swagger / OpenAPI 3.0",
          "Joi validation",
          "Helmet",
          "express-rate-limit",
          "express-mongo-sanitize",
          "HPP",
          "CORS",
        ],
      },
      {
        label: "المعمارية والأنماط",
        items: [
          "Service layer",
          "Factory pattern",
          "RBAC",
          "Middleware",
          "Data modeling",
          "Pagination",
          "MVC",
        ],
      },
    ],
  },
  about: {
    title: "نبذة عني",
    intro:
      "أنا باسم — مهندس Backend من بورسعيد، مصر، في سنتي الرابعة من دراسة علوم الحاسب بجامعة قناة السويس (دفعة 2027). أبني وأشغّل الـ Backend الإنتاجي لموقع Trosc: API بـ Express و MongoDB يضم أكثر من 85 نقطة نهاية ويخدم أكثر من 200 عضو.",
    story:
      "بدأ طريقي مع البرمجيات مبكرًا: تشجيعُ معلّم قادني إلى أول موقع ويب أبنيه في الحادية عشرة، ونشأتي في ورشة عائلية لإصلاح الإلكترونيات علّمتني أن أتعامل مع التقنية من الداخل — أن أفهمها أولًا، ثم أجعلها تعمل من أجلي.",
    community:
      "منذ 2022 وأنا أبرمج بجدّية: مشاركتي في ICPC صقلت طريقتي في تفكيك المشكلات، وتدريسي البرمجة الكائنية بـ C++ لأكثر من 50 طالبًا في GDG SCU (8 أسابيع، أبريل–مايو 2025) علّمني تبسيط المعقّد، وفترتاي كمنسّق موارد بشرية في Mech Hackers أبقياني قريبًا من المجتمع الذي بدأت منه.",
    today:
      "اليوم، بصفتي رئيسًا لقسم IT وقائدًا لفريق Backend في Trosc، أهتم بالأجزاء التي لا تلفت النظر لكنها تصنع الفرق: معمارية نظيفة، وأمان متعدد الطبقات، وواجهات برمجية يستطيع أي مهندس آخر العمل عليها دون أن يسألني شيئًا.",
    chips: ["Node.js", "Express", "MongoDB", "REST APIs", "TypeScript", "برمجة تنافسية"],
    facts: [
      { label: "الموقع", value: "بورسعيد، مصر" },
      { label: "التعليم", value: "بكالوريوس علوم حاسب — جامعة قناة السويس" },
      { label: "الدفعة", value: "2027 · السنة الرابعة · GPA 3.48/4.0" },
      { label: "متاح لـ", value: "التدريب · الوظائف المبتدئة · العمل الحر" },
    ],
  },
  experience: {
    title: "الخبرة",
    entries: [
      {
        role: "رئيس قسم IT وقائد فريق Backend",
        org: "Trosc Student Club",
        period: "يناير 2025 – حتى الآن",
        text: "صمّمت ونشرت الـ REST API الإنتاجي للنادي — أكثر من 85 نقطة نهاية عبر 6 نماذج Mongoose و9 خدمات مخصّصة — يخدم المسارات والدورات والجلسات والفعاليات والإعلانات لأكثر من 200 عضو، مع مصادقة JWT ثنائية، وتحكّم بالوصول على 3 مستويات، ونموذج أمان من 7 طبقات. وأقود فريق IT بالنادي.",
      },
      {
        role: "مدرّس البرمجة الكائنية (OOP)",
        org: "Google Developer Groups on Campus — SCU",
        period: "أبريل – مايو 2025",
        text: "درّست C++ والبرمجة الكائنية لأكثر من 50 طالبًا على مدى 8 أسابيع — من الأصناف والوراثة إلى عادات التصميم النظيف.",
      },
      {
        role: "منسّق موارد بشرية وعضو",
        org: "Mech Hackers Community",
        period: "فترتان",
        text: "نسّقت عمل الموارد البشرية خلال فترتين وبقيت عضوًا فاعلًا في المجتمع — هاكاثونات وفعاليات ومشاركة معرفية.",
      },
    ],
  },
  education: {
    title: "التعليم",
    facts: [
      { label: "الجامعة", value: "جامعة قناة السويس" },
      { label: "البرنامج", value: "بكالوريوس علوم الحاسب" },
      { label: "الدفعة", value: "2027 · السنة الرابعة" },
      { label: "المعدل", value: "3.48 / 4.0" },
    ],
    courseworkHeading: "مقررات ذات صلة",
    coursework: [
      "هندسة البرمجيات",
      "أنظمة التشغيل",
      "شبكات الحاسوب",
      "هياكل البيانات",
      "قواعد البيانات",
    ],
    achievementsHeading: "إنجازات",
    achievements: [
      "مشارك برمجة تنافسية ICPC",
      "رئيس قسم IT وقائد Backend في Trosc Student Club",
      "درّست OOP لأكثر من 50 طالبًا في GDG SCU",
      "عضو فاعل في مجتمع Mech Hackers",
    ],
    certificationsHeading: "الشهادات",
    certifications: [
      "شهادة Cloud Architecture الاحترافية — ITI",
      "تطوير ويب PHP — مسار Full Stack (120 ساعة) — ITI",
      "تطوير الويب بـ React JS — مسار 144 ساعة — ITI (يوليو–أغسطس 2026)",
      "شهادة تقدير — مدرّس OOP، GDG SCU (2025)",
      "شهادة نائب رئيس قسم IT — Trosc Student Club",
    ],
  },
  contact: {
    title: "تواصل معي",
    lead: "متاح لفرص التدريب والوظائف المبتدئة والعمل الحر. البريد الإلكتروني أسرع وسيلة للوصول إليّ — وعادةً أرد خلال ساعات.",
    emailLabel: "البريد",
    phoneLabel: "الهاتف",
    locationLabel: "الموقع",
    timeLabel: "التوقيت المحلي",
    location: "بورسعيد، مصر",
    socialsAria: "ملفات التواصل",
    linkedin: "ملف LinkedIn",
    github: "ملف GitHub",
    downloadCv: "تحميل السيرة الذاتية",
  },
  palette: {
    trigger: "البحث والأوامر",
    placeholder: "اكتب أمرًا أو ابحث…",
    empty: "لا توجد أوامر مطابقة.",
    ariaLabel: "لوحة الأوامر",
    close: "إغلاق لوحة الأوامر",
    hint: "↑ ↓ للتنقل · Enter للاختيار · Esc للإغلاق",
    groups: {
      navigate: "تنقّل",
      actions: "إجراءات",
      connect: "تواصل",
    },
    items: {
      theme: "تبديل المظهر",
      languageToAr: "التبديل إلى العربية",
      languageToEn: "Switch to English",
      cv: "تحميل السيرة الذاتية",
      email: "راسلني بالبريد",
      github: "ملف GitHub",
      linkedin: "ملف LinkedIn",
    },
  },
  github: {
    loading: "جارٍ جلب المشاريع من GitHub…",
    tryAgain: "حاول مجددًا",
    viewOnGithub: "عرض على GitHub",
    demo: "عرض حيّ",
    created: "أُنشئ",
    updated: "آخر تحديث",
    stars: "النجوم",
    forks: "التفرعات",
    watchers: "المتابعون",
    issues: "المشكلات المفتوحة",
    noRepos: "لا توجد مستودعات عامة.",
    errors: {
      userNotFound: "مستخدم GitHub غير موجود — تحقق من اسم المستخدم.",
      rateLimit: "تم تجاوز حد طلبات GitHub — حاول مجددًا خلال ساعة.",
      timeout: "انتهت مهلة الطلب — تحقق من اتصالك وحاول مجددًا.",
      cancelled: "تم إلغاء الطلب.",
      generic: "تعذّر تحميل مشاريع GitHub حاليًا.",
    },
  },
  links: {
    metadataTitle: "باسم عصام — كل روابطي",
    metadataDescription:
      "كل روابطي المهمة في مكان واحد — باسم عصام، مهندس Backend وطالب علوم حاسب",
    backToPortfolio: "العودة إلى الموقع",
    name: "باسم عصام",
    role: "مهندس Backend وطالب علوم حاسب",
    tagline: "أبني أنظمة قابلة للتوسع بـ Node.js و Express",
    location: "بورسعيد، مصر",
    cards: {
      portfolio: "الموقع الشخصي",
      portfolioDesc: "استعرض أعمالي ومشاريعي",
      github: "GitHub",
      githubDesc: "اطّلع على الكود والمشاريع",
      linkedin: "LinkedIn",
      linkedinDesc: "لنتواصل بشكل احترافي",
      email: "راسلني عبر البريد",
      phone: "اتصل بي",
      trosc: "موقع Trosc",
      troscDesc: "مشروع تطوير Backend",
      cv: "تحميل السيرة الذاتية",
      cvDesc: "اطّلع على خبراتي وتفاصيلي",
    },
  },
};

export default ar;