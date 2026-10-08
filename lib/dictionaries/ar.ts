import type { Dictionary } from "@/lib/dictionaries/en";

const ar: Dictionary = {
  metadata: {
    title: "باسم عصام | مطوّر Backend",
    description:
      "باسم عصام — مطوّر Backend وطالب علوم حاسب، متخصص في Node.js و Express وبناء الأنظمة القابلة للتوسع",
    keywords: "مطوّر Backend, Node.js, Express, MongoDB, تطوير الويب",
    shareDescription:
      "مطوّر Backend وطالب علوم حاسب — متخصص في Node.js و Express وبناء الأنظمة القابلة للتوسع.",
  },
  nav: {
    home: "باسم عصام",
    ariaHome: "باسم عصام — الرئيسية",
    about: "نبذة عني",
    stack: "التقنيات",
    experience: "الخبرة",
    projects: "المشاريع",
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
  stack: {
    title: "التقنيات",
    groups: [
      {
        label: "الواجهة الخلفية",
        items: [
          "Node.js",
          "Express",
          "REST API design",
          "Authentication & authorization",
          "PHP",
          "Laravel",
        ],
      },
      {
        label: "البيانات",
        items: ["MongoDB (Mongoose)", "MySQL", "Redis"],
      },
      {
        label: "التشغيل والأدوات",
        items: ["Docker", "Kubernetes", "Git & GitHub", "Linux administration", "Bash scripting"],
      },
      {
        label: "الواجهة الأمامية",
        items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Responsive design"],
      },
      {
        label: "الممارسات",
        items: ["OOP", "Clean architecture", "Design patterns", "Scalable systems"],
      },
      {
        label: "خارج الكود",
        items: [
          "التدريس والإرشاد — GDG SCU",
          "قيادة الفريق — Trosc IT",
          "حل المشكلات التنافسي — ICPC",
        ],
      },
    ],
  },
  about: {
    title: "نبذة عني",
    intro:
      "أنا باسم — مطوّر Backend من بورسعيد، مصر، في سنتي الرابعة من دراسة علوم الحاسب بجامعة قناة السويس (دفعة 2027). أبني وأشغّل الـ Backend الإنتاجي لموقع Trosc: API بـ Express و MongoDB يضم أكثر من 85 نقطة نهاية ويخدم أكثر من 200 عضو.",
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
        period: "2025 – حتى الآن",
        text: "أتولّى الـ Backend الإنتاجي للنادي: API بـ Express و MongoDB يضم أكثر من 85 نقطة نهاية و6 نماذج و9 خدمات — مع 7 طبقات أمان و11 مضيف وسائط موثوقًا، ويخدم أكثر من 200 عضو. وأقود فريق IT.",
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
      "البرمجة الكائنية",
      "أساسيات تطوير الـ Backend",
      "إدارة Linux",
      "تطوير PHP / Laravel",
      "أساسيات Node.js",
    ],
    achievementsHeading: "إنجازات",
    achievements: [
      "مشارك برمجة تنافسية ICPC",
      "رئيس قسم IT وقائد Backend في Trosc Student Club",
      "درّست OOP لأكثر من 50 طالبًا في GDG SCU",
      "عضو فاعل في مجتمع Mech Hackers",
    ],
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
      stack: "التقنيات",
      about: "نبذة عني",
      experience: "الخبرة",
      projects: "المشاريع",
      education: "التعليم",
      contact: "تواصل معي",
      links: "كل روابطي",
      theme: "تبديل المظهر",
      languageToAr: "التبديل إلى العربية",
      languageToEn: "Switch to English",
      cv: "تحميل السيرة الذاتية",
      email: "راسلني بالبريد",
      github: "ملف GitHub",
      linkedin: "ملف LinkedIn",
    },
  },
  links: {
    metadataTitle: "باسم عصام — كل روابطي",
    metadataDescription:
      "كل روابطي المهمة في مكان واحد — باسم عصام، مطوّر Backend وطالب علوم حاسب",
    backToPortfolio: "العودة إلى الموقع",
    name: "باسم عصام",
    role: "مطوّر Backend وطالب علوم حاسب",
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
      trosc: "موقع Trosc",
      troscDesc: "مشروع تطوير Backend",
      cv: "تحميل السيرة الذاتية",
      cvDesc: "اطّلع على خبراتي وتفاصيلي",
    },
  },
};

export default ar;