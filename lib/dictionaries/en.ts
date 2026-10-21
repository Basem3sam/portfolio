type ProjectStatus = "production" | "development" | "complete" | "research" | "academic";

type ExperienceEntry = {
  role: string;
  org: string;
  period: string;
  text: string;
  /** The role held now; gets the highlighted card and the case-study link. */
  current?: boolean;
  /** Short facts, each one taken from the entry's own text. */
  chips: string[];
};

type StackTech = {
  /** Two-letter chip abbreviation shown in the tech's icon slot. */
  abbr: string;
  name: string;
};

type WorkPlate = {
  /** Caption under the plate's node diagram. */
  caption: string;
  /** Ordered request path; `hot` highlights a step, `live` marks the store. */
  path?: { label: string; hot?: boolean; live?: boolean }[];
  /** Grouped services list (Docker Compose, RTL storefront…). */
  group?: { label: string; hot?: boolean }[];
  /** Caption above the grouped list. */
  groupCaption?: string;
  /** Two figure facts pinned to the plate's foot. */
  foot?: { value: string; label: string }[];
};

type WorkProject = {
  id: string;
  name: string;
  /** Display title; defaults to `name`. */
  title?: string;
  status: ProjectStatus;
  /** Plain-words origin of the project (freelance, coursework...). Optional. */
  provenance?: string;
  /** Who it was for and since when — featured project only. */
  org?: string;
  period?: string;
  /** Headline facts for the featured project, all verified in the repo. */
  stats?: { value: string; label: string }[];
  description: string;
  detail: string;
  tech: string[];
  /** Decorative plate diagram; rendered as a figure, hidden from a11y tree. */
  plate?: WorkPlate;
  /** Which link buttons this project shows: case study, repo, live site. */
  actions?: ("case" | "repo" | "live")[];
};

const projects: WorkProject[] = [
  {
    id: "trosc",
    name: "trosc-backend",
    title: "Trosc backend",
    status: "production",
    org: "Trosc Student Club, Suez Canal University",
    period: "Jan 2025 – present",
    stats: [
      { value: "100+", label: "endpoints" },
      { value: "12", label: "collections" },
      { value: "17", label: "services" },
      { value: "94.8%", label: "statement coverage" },
      { value: "200+", label: "members" },
    ],
    description:
      "The API behind Trosc Student Club's learning platform at Suez Canal University. It began in January 2025 as a club website and grew into a production system serving tracks, courses, video sessions, events, announcements, assignments, weekly tasks, and reviews, on infrastructure that costs nothing to run.",
    detail:
      "3-tier RBAC with dual-token auth, enrollment prerequisites (public / track-only / private), bulk user operations with admin-protection guards, and a background email service. Swagger/OpenAPI 3.0 docs served interactively at /api-docs.",
    tech: ["Node.js", "Express", "MongoDB", "Mongoose", "JWT", "Swagger", "Joi"],
    plate: {
      caption: "request path, in order",
      path: [
        { label: "client" },
        { label: "rate limit" },
        { label: "JWT", hot: true },
        { label: "RBAC" },
        { label: "services" },
        { label: "MongoDB", live: true },
      ],
      foot: [
        { value: "13", label: "documented security controls" },
        { value: "14", label: "trusted hosts" },
      ],
    },
    actions: ["case", "repo", "live"],
  },
  {
    id: "store-advisor",
    name: "store-advisor",
    status: "development",
    provenance: "Product build",
    description:
      "A cross-source monitoring agent for e-commerce merchants. It connects a store and its ad accounts, runs checks that join data across both, finds problems no single dashboard can see, prices them in dollars, explains them in plain language, and fixes them with the merchant's approval.",
    detail:
      "Six Docker Compose services: a NestJS API and scheduler worker, a Python AI service, a Next.js dashboard, Postgres, and Redis. Design rule: the check finds the problem, the LLM explains it, and it never invents a number.",
    tech: ["NestJS", "PostgreSQL", "Redis", "Python", "Next.js", "Docker"],
    plate: {
      caption: "six services, one compose file",
      groupCaption: "docker compose · 6 services",
      group: [
        { label: "api" },
        { label: "worker" },
        { label: "ai", hot: true },
        { label: "dashboard" },
        { label: "postgres" },
        { label: "redis" },
      ],
    },
  },
  {
    id: "zabthalahak",
    name: "zabthalahak",
    status: "development",
    provenance: "Freelance, live site",
    description:
      "A freelance build for a real 3D-printing business: an Arabic-first, RTL storefront and admin dashboard covering orders, custom requests, inventory, printers, customers, reports, and an audit log. Built with React 19, Vite, and Tailwind over a data layer already shaped for the real API.",
    detail: "The Node.js / Express / MongoDB modular-monolith backend is in development.",
    tech: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "MongoDB"],
    plate: {
      caption: "arabic-first, right to left",
      groupCaption: "rtl storefront",
      group: [
        { label: "storefront" },
        { label: "admin", hot: true },
        { label: "orders" },
        { label: "inventory" },
        { label: "audit log" },
      ],
    },
    actions: ["live"],
  },
  {
    id: "laravel",
    name: "laravel-ecommerce-app",
    status: "complete",
    provenance: "Full-stack project",
    description:
      "A full-stack e-commerce app with auth, an admin dashboard, a cart, and order placement. It uses Eloquent ORM relationships with eager loading, MVC architecture, and Laravel form-request validation with database transaction wrappers.",
    detail: "",
    tech: ["PHP", "Laravel", "MySQL", "Blade"],
    plate: {
      caption: "mvc",
      path: [
        { label: "routes" },
        { label: "controller" },
        { label: "Eloquent", hot: true },
        { label: "MySQL" },
      ],
    },
    actions: ["repo"],
  },
  {
    id: "neuroscan",
    name: "neuroscan-ai",
    status: "academic",
    provenance: "Team project, third-year practical exam",
    description:
      "A hybrid brain-tumor detection pipeline across 6+ CNN-KNN-KMeans ensemble models with OpenCV preprocessing and multi-model consensus scoring, plus data augmentation, cross-validation, and a swappable classifier architecture for reproducible A/B testing.",
    detail: "Team project — third-year practical exam.",
    tech: ["Python", "PyTorch", "CNN", "KNN", "KMeans", "OpenCV"],
    plate: {
      caption: "pipeline",
      path: [
        { label: "OpenCV" },
        { label: "CNN", hot: true },
        { label: "KNN" },
        { label: "KMeans" },
        { label: "consensus" },
      ],
    },
    actions: ["repo"],
  },
];

const en = {
  metadata: {
    title: "Basem Esam | Backend Engineer",
    description:
      "Basem Esam - Backend Engineer & CS Student specializing in Node.js, Express, and scalable systems",
    keywords: "Backend Engineer, Backend Developer, Node.js, Express, MongoDB, Web Development",
    shareDescription:
      "Backend Engineer & CS Student specializing in Node.js, Express, and scalable systems.",
  },
  nav: {
    home: "Basem Esam",
    ariaHome: "Basem Esam - Home",
    work: "Work",
    stack: "Stack",
    about: "About",
    experience: "Experience",
    contact: "Contact",
    allLinks: "All my links",
    links: "Links",
    search: "Search",
    letsTalk: "Let's talk",
    resume: "Resume",
    backToTop: "Back to top",
    skipToContent: "Skip to main content",
    toggleNavigation: "Toggle navigation",
    mainNavigation: "Main navigation",
  },
  theme: {
    toLight: "Switch to light mode",
    toDark: "Switch to dark mode",
  },
  footer: {
    rights: "All rights reserved.",
    openTerminal: "Open the secret terminal",
    navLabel: "Footer navigation",
    line: "Backend engineer building scalable systems with Node.js and Express.",
    avail: "Open to internships, junior roles and freelance",
    exploreLabel: "Explore",
    reachLabel: "Reach me",
    basedLabel: "Based in",
    city: "Port Said, Egypt",
    timeLabel: "local time",
    backToTop: "Back to top",
    quiet: "Not everything here is on the menu.",
  },
  notFound: {
    label: "HTTP 404",
    title: "Page not found",
    message: "This page does not exist. It may have moved, or the address might be mistyped.",
    backHome: "Back to home",
    viewLinks: "All my links",
  },
  hero: {
    whoami: "$ whoami",
    name: "Basem Esam",
    role: "Backend engineer",
    location: "Port Said, Egypt",
    portraitAlt: "Portrait of Basem Esam",
    builtWith: "Built with",
    lead: "I build and run the backend behind a real platform: authentication, roles, and tests included, while finishing my Computer Science degree (class of 2027).",
    statusKey: "STATUS",
    status: "Open to work",
    statusDetail: "Internships · junior backend · freelance · remote or on-site in Egypt",
    note: "yes, that's me",
    viewWork: "View my work",
    downloadCv: "Download CV",
    socialsAria: "Social media links",
    socials: {
      linkedin: "LinkedIn profile",
      github: "GitHub profile",
      email: "Email Basem Esam",
      phone: "Call Basem Esam",
    },
  },
  work: {
    title: "Work",
    lead: "One system in production, two builds in progress, and two earlier projects.",
    liveLabel: "live from github",
    viewRepo: "Repository",
    viewLive: "Live site",
    caseStudy: "Case study",
    viewProfile: "View profile on GitHub",
    moreOnGithub: "More on GitHub",
    moreOnGithubText:
      "The live repository list renders here, fetched in the browser. Repositories shown above are excluded so nothing appears twice.",
    status: {
      production: "In production",
      development: "In development",
      complete: "Complete",
      research: "Research",
      academic: "Academic",
    },
    projects,
  },
  stack: {
    title: "Stack",
    lead: "Follow one request through the stack.",
    caption: "one request · five layers",
    stages: [
      {
        n: "01",
        key: "Edge",
        title: "Security",
        cap: "Every request is checked before it reaches the app.",
        techs: [
          { abbr: "He", name: "Helmet" },
          { abbr: "RL", name: "express-rate-limit" },
          { abbr: "Sz", name: "express-mongo-sanitize" },
          { abbr: "HP", name: "HPP" },
          { abbr: "Co", name: "CORS" },
        ],
      },
      {
        n: "02",
        key: "Gate",
        title: "Validation & auth",
        cap: "Who you are, and whether what you sent is valid.",
        techs: [
          { abbr: "Jo", name: "Joi validation" },
          { abbr: "JW", name: "JWT authentication" },
          { abbr: "Sw", name: "Swagger / OpenAPI 3.0" },
        ],
      },
      {
        n: "03",
        key: "App",
        title: "Backend & APIs",
        cap: "Where the logic lives.",
        techs: [
          { abbr: "Nd", name: "Node.js" },
          { abbr: "Ex", name: "Express.js" },
          { abbr: "Ns", name: "NestJS" },
          { abbr: "Rt", name: "REST API design" },
          { abbr: "Ph", name: "PHP · Laravel" },
        ],
      },
      {
        n: "04",
        key: "Data",
        title: "Data",
        cap: "Stored, indexed and queried.",
        techs: [
          { abbr: "Mg", name: "MongoDB (Mongoose)" },
          { abbr: "Sc", name: "Schema design" },
          { abbr: "Ix", name: "Compound & text indexing" },
          { abbr: "Ag", name: "Aggregation pipelines" },
          { abbr: "Pg", name: "PostgreSQL" },
          { abbr: "My", name: "MySQL" },
        ],
      },
      {
        n: "05",
        key: "Ship",
        title: "Tools & delivery",
        cap: "Linted, versioned and shipped.",
        techs: [
          { abbr: "Dk", name: "Docker" },
          { abbr: "Gt", name: "Git" },
          { abbr: "Lx", name: "Linux · Bash" },
          { abbr: "Es", name: "ESLint · Prettier" },
        ],
      },
    ] as { n: string; key: string; title: string; cap: string; techs: StackTech[] }[],
    alsoLabel: "Also writes",
    also: [
      { abbr: "JS", name: "JavaScript" },
      { abbr: "TS", name: "TypeScript" },
      { abbr: "Py", name: "Python" },
      { abbr: "C+", name: "C++" },
      { abbr: "Rx", name: "React" },
      { abbr: "Nx", name: "Next.js" },
      { abbr: "Tw", name: "Tailwind CSS" },
    ] as StackTech[],
  },
  about: {
    title: "About",
    lead: "I'm Basem, a backend engineer from Port Said, Egypt, studying Computer Science at Suez Canal University (class of 2027). I care about the parts of a system that are easy to skip: clear architecture, layered security, and APIs another engineer can pick up without asking me anything.",
    body: "Growing up around a family electronics repair shop taught me to understand a thing from the inside before making it work. I compete in ICPC, taught OOP at GDG SCU, and served two terms as HR Coordinator at Mech Hackers.",
    timelineLabel: "Timeline",
    timeline: [
      { year: "Age 11", title: "First website", text: "A teacher's encouragement started it." },
      { year: "2022", title: "Programming seriously", text: "Competing in ICPC since." },
      { year: "2025", title: "Trosc backend", text: "Also taught OOP at GDG SCU." },
      {
        year: "2027",
        title: "B.Sc. Computer Science",
        text: "Expected, Suez Canal University.",
        next: true,
      },
    ] as { year: string; title: string; text: string; next?: boolean }[],
    educationLabel: "Education",
    degree: "B.Sc. Computer Science",
    university: "Suez Canal University",
    degreePills: ["Class of 2027 (expected)", "GPA 3.48 / 4.0"],
    courseworkLabel: "Coursework",
    coursework: [
      "Software Engineering",
      "Operating Systems",
      "Computer Networks",
      "Data Structures",
      "Database Systems",
    ],
    certificationsLabel: "Certifications",
    certifications: [
      { name: "Cloud Architecture, Professional Certification", org: "ITI" },
      { name: "PHP Web Development, 120-hour Full Stack Track", org: "ITI" },
      { name: "Web Development using React JS, 144-hour Track (Jul–Aug 2026)", org: "ITI" },
      { name: "Certificate of Appreciation, OOP Instructor (2025)", org: "GDG SCU" },
    ] as { name: string; org: string }[],
  },
  experience: {
    title: "Experience",
    currentLabel: "Current role",
    caseStudy: "Read the case study",
    hint: "keep scrolling, it's a short story",
    entries: [
      {
        role: "IT Head & Backend Lead",
        org: "Trosc Student Club",
        period: "Jan 2025 – present",
        current: true,
        chips: ["100+ endpoints", "94.8% statement coverage", "200+ members"],
        text: "Built and runs the club's production API, and leads its IT team.",
      },
      {
        role: "OOP Instructor",
        org: "Google Developer Groups on Campus, SCU",
        period: "Apr – May 2025",
        chips: ["50+ students", "8 weeks", "C++ · OOP"],
        text: "Taught C++ and object-oriented programming to 50+ students over 8 weeks, from classes and inheritance to clean design habits.",
      },
      {
        role: "HR Coordinator & Member",
        org: "Mech Hackers Community",
        period: "2 terms",
        chips: ["2 terms", "Hackathons", "Events"],
        text: "Coordinated HR across two terms and stayed an active member: hackathons, events, and knowledge sharing.",
      },
    ] as ExperienceEntry[],
  },
  contact: {
    title: "Contact",
    big: "Let's build something reliable.",
    lead: "Open to internships, junior backend roles, and freelance work. Email is the fastest way to reach me.",
    sendEmail: "Send an email",
    status: "operational",
    emailLabel: "email",
    phoneLabel: "Phone",
    linkedinLabel: "LinkedIn",
    githubLabel: "GitHub",
    locationLabel: "Location",
    location: "Port Said, Egypt",
    timeLabel: "local time",
    socialsAria: "Social profiles",
    linkedin: "LinkedIn profile",
    github: "GitHub profile",
    downloadCv: "Download CV",
  },
  palette: {
    trigger: "Search & commands",
    placeholder: "Type a command or search…",
    empty: "No matching command.",
    ariaLabel: "Command palette",
    close: "Close palette",
    hint: "↑ ↓ navigate · Enter select · Esc close",
    groups: {
      navigate: "Navigate",
      actions: "Actions",
      connect: "Connect",
    },
    items: {
      theme: "Toggle theme",
      terminal: "Secret terminal",
      languageToAr: "التبديل إلى العربية",
      languageToEn: "Switch to English",
      cv: "Download CV",
      email: "Email me",
      github: "GitHub profile",
      linkedin: "LinkedIn profile",
    },
  },
  github: {
    loading: "Fetching projects from GitHub…",
    tryAgain: "Try again",
    viewOnGithub: "View on GitHub",
    demo: "Demo",
    created: "Created",
    updated: "Updated",
    stars: "Stars",
    forks: "Forks",
    watchers: "Watchers",
    issues: "Open issues",
    noRepos: "No public repositories found.",
    errors: {
      userNotFound: "GitHub user not found. Please check the username.",
      rateLimit: "GitHub API rate limit exceeded. Please try again in an hour.",
      authFailed: "GitHub authentication failed. Projects are temporarily unavailable.",
      forbidden: "GitHub access is restricted. Projects are temporarily unavailable.",
      timeout: "Request timed out. Please check your connection and try again.",
      cancelled: "Request was cancelled.",
      generic: "Unable to load GitHub projects at this time.",
    },
  },
  links: {
    metadataTitle: "Basem Esam - All My Links",
    metadataDescription:
      "All my important links in one place - Basem Esam, Backend Engineer & CS Student",
    backToPortfolio: "Back to portfolio",
    name: "Basem Esam",
    role: "Backend Engineer & CS Student",
    tagline: "Building scalable systems with Node.js & Express",
    location: "Port Said, Egypt",
    cards: {
      portfolio: "Portfolio Website",
      portfolioDesc: "View my full portfolio and projects",
      github: "GitHub",
      githubDesc: "Check out my code and projects",
      linkedin: "LinkedIn",
      linkedinDesc: "Let's connect professionally",
      email: "Email Me",
      phone: "Call me",
      trosc: "Trosc Club Website",
      troscDesc: "Backend development project",
      cv: "Download Resume",
      cvDesc: "View my CV and experience",
    },
  },
};

export type Dictionary = typeof en;

export default en;
