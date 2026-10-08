type ProjectStatus = "production" | "development" | "complete" | "research" | "academic";

type WorkProject = {
  id: string;
  name: string;
  status: ProjectStatus;
  description: string;
  detail: string;
  tech: string[];
};

const projects: WorkProject[] = [
  {
    id: "trosc",
    name: "trosc-backend",
    status: "production",
    description:
      "Open-source production backend for a student-club learning platform — 85+ endpoints across 6 Mongoose models and 9 dedicated services, serving tracks, courses, sessions, events, and announcements to 200+ members. Service-layer architecture with thin controllers, reusable factory middleware, and MongoDB querying with compound indexes and virtual population.",
    detail:
      "3-tier RBAC with dual-token auth, enrollment prerequisites (public / track-only / private), bulk user operations with admin-protection guards, and an email service with 4 HTML templates. Swagger/OpenAPI 3.0 docs served interactively at /api-docs.",
    tech: ["Node.js", "Express", "MongoDB", "Mongoose", "JWT", "Swagger", "Joi"],
  },
  {
    id: "store-advisor",
    name: "store-advisor",
    status: "development",
    description:
      "A cross-source monitoring agent for e-commerce merchants: connects a store and its ad accounts, runs checks that join data across both, finds problems no single dashboard can see, prices them in dollars, explains them in plain language — and, with the merchant's approval, fixes them.",
    detail:
      "Six Docker Compose services: a NestJS API and scheduler worker, a Python AI service, a Next.js dashboard, Postgres, and Redis — with 241 tests across the three codebases. Design rule: the check finds the problem, the LLM explains it, and never invents a number.",
    tech: ["NestJS", "PostgreSQL", "Redis", "Python", "Next.js", "Docker"],
  },
  {
    id: "zabthalahak",
    name: "zabthalahak",
    status: "development",
    description:
      "Freelance build for a real 3D-printing business: an Arabic-first, RTL storefront and admin dashboard — orders, custom requests, inventory, printers, customers, reports, and an audit log — in React 19 + Vite + Tailwind, over a data layer already shaped for the real API.",
    detail: "Node.js / Express / MongoDB modular-monolith backend currently in development.",
    tech: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "MongoDB"],
  },
  {
    id: "laravel",
    name: "laravel-ecommerce-app",
    status: "complete",
    description:
      "Built a full-stack e-commerce app — auth, admin dashboard, cart, and order placement — using Eloquent ORM relationships with eager loading, MVC architecture, and Laravel form-request validation with database transaction wrappers.",
    detail: "",
    tech: ["PHP", "Laravel", "MySQL", "Blade"],
  },
  {
    id: "neuroscan",
    name: "neuroscan-ai",
    status: "academic",
    description:
      "A hybrid brain-tumor detection pipeline across 6+ CNN-KNN-KMeans ensemble models with OpenCV preprocessing and multi-model consensus scoring, plus data augmentation, cross-validation, and a swappable classifier architecture for reproducible A/B testing.",
    detail: "Team project — third-year practical exam.",
    tech: ["Python", "PyTorch", "CNN", "KNN", "KMeans", "OpenCV"],
  },
];

const en = {
  metadata: {
    title: "Basem Esam | Backend Developer",
    description:
      "Basem Esam - Backend Developer & CS Student specializing in Node.js, Express, and scalable systems",
    keywords: "Backend Developer, Node.js, Express, MongoDB, Web Development",
    shareDescription:
      "Backend Developer & CS Student specializing in Node.js, Express, and scalable systems.",
  },
  nav: {
    home: "Basem Esam",
    ariaHome: "Basem Esam - Home",
    work: "Work",
    stack: "Stack",
    about: "About",
    experience: "Experience",
    education: "Education",
    contact: "Contact",
    allLinks: "All My Links",
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
    lead: "Backend engineer who built and runs an 85+ endpoint production API for 200+ real users — while finishing a Computer Science degree (class of 2027).",
    status: "operational",
    statusDetail:
      "open to internships, junior roles & freelance · remote worldwide or on-site in Egypt",
    metrics: [
      { value: 85, suffix: "+", label: "endpoints in production" },
      { value: 200, suffix: "+", label: "members served" },
      { value: 7, suffix: "", label: "security layers" },
      { value: 11, suffix: "", label: "trusted media hosts" },
    ],
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
    liveLabel: "live from github",
    viewRepo: "View repository",
    viewLive: "Live site",
    status: {
      production: "production",
      development: "in development",
      complete: "complete",
      research: "research",
      academic: "academic",
    },
    projects,
  },
  stack: {
    title: "Stack",
    groups: [
      {
        label: "backend & apis",
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
        label: "databases",
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
        label: "devops & tools",
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
        label: "frontend",
        items: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
      },
      {
        label: "security & docs",
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
        label: "architecture & patterns",
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
    title: "About",
    intro:
      "I'm Basem — a backend developer from Port Said, Egypt, in my fourth year of Computer Science at Suez Canal University (class of 2027). I build and run the production backend that powers Trosc Student Club: an Express + MongoDB API with 85+ endpoints serving 200+ members.",
    story:
      "My path into software started early: a teacher's encouragement led to my first website at age 11, and growing up around a family electronics repair shop taught me to treat technology from the inside out — understand it first, then make it work for you.",
    community:
      "Since 2022 I've been programming seriously. ICPC competitive programming sharpened how I break down problems, teaching OOP with C++ to 50+ students at GDG SCU (8 weeks, Apr–May 2025) taught me to explain complex things simply, and two terms as HR Coordinator at Mech Hackers keep me close to the community that got me started.",
    today:
      "Today, as IT Head & Backend Lead at Trosc, I care about the unglamorous parts done well: clean architecture, layered security, and APIs another engineer can pick up without asking me anything.",
    chips: [
      "Node.js",
      "Express",
      "MongoDB",
      "REST APIs",
      "TypeScript",
      "Competitive Programming",
    ],
    facts: [
      { label: "Location", value: "Port Said, Egypt" },
      { label: "Education", value: "B.Sc. Computer Science — Suez Canal University" },
      { label: "Class", value: "2027 · 4th year · GPA 3.48/4.0" },
      { label: "Availability", value: "Internships · Junior roles · Freelance" },
    ],
  },
  experience: {
    title: "Experience",
    entries: [
      {
        role: "IT Head & Backend Lead",
        org: "Trosc Student Club",
        period: "Jan 2025 – Present",
        text: "Architected and deployed the club's production REST API — 85+ endpoints across 6 Mongoose models and 9 dedicated services — serving tracks, courses, sessions, events, and announcements to 200+ members, with dual-token JWT auth, 3-tier RBAC, and a 7-layer security model. Leads the club's IT team.",
      },
      {
        role: "OOP Instructor",
        org: "Google Developer Groups on Campus — SCU",
        period: "Apr – May 2025",
        text: "Taught C++ and object-oriented programming to 50+ students over 8 weeks — from classes and inheritance to clean design habits.",
      },
      {
        role: "HR Coordinator & Member",
        org: "Mech Hackers Community",
        period: "2 terms",
        text: "Coordinated HR across two terms and stayed an active community member — hackathons, events, and knowledge sharing.",
      },
    ],
  },
  education: {
    title: "Education",
    facts: [
      { label: "institution", value: "Suez Canal University" },
      { label: "program", value: "B.Sc. Computer Science" },
      { label: "class", value: "2027 · 4th year" },
      { label: "gpa", value: "3.48 / 4.0" },
    ],
    courseworkHeading: "Relevant coursework",
    coursework: [
      "Software Engineering",
      "Operating Systems",
      "Computer Networks",
      "Data Structures",
      "Database Systems",
    ],
    achievementsHeading: "Highlights",
    achievements: [
      "ICPC competitive programmer",
      "IT Head & Backend Lead at Trosc Student Club",
      "Taught OOP to 50+ students at GDG SCU",
      "Active in the Mech Hackers community",
    ],
    certificationsHeading: "Certifications",
    certifications: [
      "Cloud Architecture — Professional Certification, ITI",
      "PHP Web Development — 120-hour Full Stack Track, ITI",
      "Web Development using React JS — 144-hour Track, ITI (Jul–Aug 2026)",
      "Certificate of Appreciation — OOP Instructor, GDG SCU (2025)",
      "Vice IT Head Certificate — Trosc Student Club",
    ],
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
      timeout: "Request timed out. Please check your connection and try again.",
      cancelled: "Request was cancelled.",
      generic: "Unable to load GitHub projects at this time.",
    },
  },
  links: {
    metadataTitle: "Basem Esam - All My Links",
    metadataDescription:
      "All my important links in one place - Basem Esam, Backend Developer & CS Student",
    backToPortfolio: "Back to portfolio",
    name: "Basem Esam",
    role: "Backend Developer & CS Student",
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
      trosc: "Trosc Club Website",
      troscDesc: "Backend development project",
      cv: "Download Resume",
      cvDesc: "View my CV and experience",
    },
  },
};

export type Dictionary = typeof en;

export default en;