# 💼 Basem Esam — Portfolio

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://basemesam.vercel.app/)
[![CI](https://github.com/basem3sam/portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/basem3sam/portfolio/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENCE)

> **Backend Developer · Computer Science Student · IT Head & Backend Lead**
>
> A bilingual English / العربية portfolio built to showcase real backend engineering, production APIs, system architecture, testing, security, and the engineering decisions behind them.

**85+ API endpoints · 200+ members · 7 security layers · 95%+ test coverage**

[🌐 View Portfolio](https://basemesam.vercel.app/) · [💼 LinkedIn](https://linkedin.com/in/BasemEsam) · [🐙 GitHub](https://github.com/basem3sam)

---

## 🧭 About the Project

This repository contains my personal portfolio and engineering showcase.

It is intentionally built as more than a static portfolio. The application demonstrates how I approach software engineering through:

- Production-oriented backend architecture
- API design and documentation
- Authentication and authorization
- Security and data protection
- Automated testing
- Accessibility
- Performance optimization
- Internationalization and RTL
- SEO and structured metadata
- CI quality gates
- Maintainable component architecture

The main technical case study is **Trosc**, a production backend I architect and maintain for a student-club platform serving **200+ members through 85+ API endpoints**.

---

# ✨ Features

### 🌍 Internationalization

- English and Arabic with real RTL support
- Clean public URLs: `/` and `/ar`
- Localized `/links` and `/work/trosc` pages
- Proper `<html lang>` and `dir` attributes
- Typed translation dictionaries
- Locale-aware navigation
- Logical CSS properties for automatic RTL mirroring
- Canonical and `hreflang` metadata

### 🧭 Command Palette

Press `Ctrl/Cmd + K` to access the command palette.

It provides:

- Section navigation
- Page navigation
- Theme switching
- Language switching
- CV access
- Contact shortcuts
- Full keyboard navigation
- Focus trapping
- Combobox/listbox semantics

### 📊 Production Metrics

The homepage highlights real engineering metrics using accessible, reduced-motion-aware animations:

| Metric | Value |
|---|---:|
| API endpoints | **85+** |
| Members served | **200+** |
| Security layers | **7** |
| Trusted media hosts | **11** |

### 🧪 Interactive API Explorer

The Trosc case study includes an endpoint explorer with:

- HTTP method badges
- Authentication/access indicators
- JSON response highlighting
- Simulated requests
- Latency information
- Rate-limit headers
- Curated mock responses clearly labeled as mocks

### 🎨 Theme System

- Light / dark themes
- OS preference fallback
- `localStorage` persistence
- Theme initialization before first paint
- Theme-aware favicons
- Keyboard shortcut: `Ctrl/Cmd + Shift + D`

### ♿ Accessibility

- WCAG AA contrast
- 44px touch targets
- Skip navigation
- Visible focus states
- Semantic landmarks
- Keyboard navigation
- `aria-live` announcements
- Reduced-motion support
- Accessible command palette
- Automated axe-core testing

### 📡 GitHub Integration

Live repository data with:

- GitHub REST API
- 15-minute client-side caching
- Retry handling
- 10-second request timeout
- Rate-limit awareness
- Fork/archive filtering
- Star/activity sorting
- Localized error states
- Manual retry support

### 🔍 SEO

- Per-locale canonical URLs
- `hreflang`
- Sitemap
- Robots configuration
- JSON-LD `Person`
- Localized Open Graph metadata
- Static 1200×630 OG image generated with `next/og`

### 🖨️ Print Support

A dedicated print stylesheet:

- Forces readable light tokens
- Removes navigation/chrome
- Reveals hidden content
- Expands repository URLs
- Optimizes the page for paper/PDF output

### 🕹️ Hidden Developer Terminal

A deliberately hidden developer experience featuring:

- Konami Code
- Mobile keypad
- Keyboard shortcut
- Command history
- Sound effects
- Achievement system
- Confetti effects
- Persistent unlock state
- Lazy loading so it adds no initial cost

---

# 🧱 Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) — App Router |
| UI | [React 19](https://react.dev/) |
| Language | [TypeScript 5.9](https://www.typescriptlang.org/) — strict |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Fonts | IBM Plex Sans · IBM Plex Sans Arabic · IBM Plex Mono |
| Icons | Inline SVG icon system |
| API | [GitHub REST API](https://docs.github.com/en/rest) |
| OG Generation | `next/og` |
| Testing | Playwright · axe-core |
| Code Quality | ESLint 9 · Prettier |
| Performance | Lighthouse CI |
| Browser APIs | Web Audio API · Web Animations API |

### Dependency philosophy

The production runtime is intentionally small:

```text
next
react
react-dom
```

Testing, linting, formatting, and other tooling remain development dependencies.

---

# 🚀 Getting Started

## Requirements

- Node.js `20.9+`
- npm
- Internet access during the first build for `next/font`

## Installation

```bash
git clone https://github.com/basem3sam/portfolio.git
cd portfolio
npm install
npx playwright install chromium
npm run dev
```

Open:

```text
http://localhost:3000
```

## Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm start` | Serve production build |
| `npm run typecheck` | Strict TypeScript checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Automatically fix supported ESLint issues |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Verify formatting |
| `npm test` | Run Playwright E2E suite |
| `npm run test:ui` | Open Playwright UI |
| `npm run lighthouse` | Run Lighthouse CI locally |

---

# 📂 Project Structure

```text
portfolio/
├── app/
│   ├── [lang]/
│   │   ├── layout.tsx
│   │   ├── opengraph-image.tsx
│   │   ├── not-found.tsx
│   │   ├── (site)/
│   │   │   ├── page.tsx
│   │   │   └── work/
│   │   │       └── trosc/
│   │   │           └── page.tsx
│   │   └── (links)/
│   │       └── links/
│   │           └── page.tsx
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/
│   ├── behavior/
│   ├── case-study/
│   ├── easter-egg/
│   ├── github/
│   ├── layout/
│   ├── links/
│   ├── palette/
│   ├── seo/
│   ├── sections/
│   └── ui/
│
├── data/
│   ├── site.ts
│   └── trosc.ts
│
├── lib/
│   ├── dictionaries/
│   ├── i18n.ts
│   ├── github.ts
│   ├── theme.ts
│   ├── scroll.ts
│   ├── scrollLock.ts
│   ├── sounds.ts
│   ├── effects.ts
│   └── terminalCommands.ts
│
├── tests/
│
├── public/
│   └── assets/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── lighthouserc.json
├── playwright.config.ts
├── next.config.ts
├── proxy.ts
├── eslint.config.mjs
├── .prettierrc.json
├── postcss.config.mjs
└── tsconfig.json
```

---

# 🔧 Architecture

## 🌍 Routing & Languages

The application uses a locale segment internally while keeping the public URL clean.

| Language | Home | Links | Trosc |
|---|---|---|---|
| 🇬🇧 English | `/` | `/links` | `/work/trosc` |
| 🇪🇬 Arabic | `/ar` | `/ar/links` | `/ar/work/trosc` |

`proxy.ts` rewrites clean English routes internally to `/en/*` while keeping `/` visible in the browser.

This allows:

- Clean URLs
- No `/en` exposed to users
- Legacy links to continue working
- Locale-aware routing
- Canonical URL normalization

`next.config.ts` also handles legacy redirects such as:

```text
/index.html → /
/links.html → /links
```

Security headers are configured for:

```text
X-Frame-Options
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
```

Unknown routes return a proper bilingual 404 response.

---

## ⌨️ Command Palette

The command palette can be opened with:

```text
Ctrl/Cmd + K
```

Navigation supports:

```text
↑ ↓       Move
Home      First result
End       Last result
Enter     Activate
Esc       Close
Tab       Focus trap
```

Section commands use real anchors so they integrate with the site's scrolling and focus behavior.

---

## 🎨 Theme Architecture

Theme state is stored in:

```text
localStorage["theme"]
```

The theme is applied to `<body>` before the first paint to avoid a flash of the incorrect theme.

Theme controls are available through:

- Navbar
- Links page
- Command palette
- Keyboard shortcut

```text
Ctrl/Cmd + Shift + D
```

Design tokens are defined as CSS variables on:

```css
:root
.dark-mode
```

and exposed to Tailwind through `@theme inline`.

---

# 🚀 Trosc Backend — Main Case Study

The most important project represented by this portfolio is **Trosc**, a production backend for a student-club platform.

It is built with:

```text
Node.js
Express
MongoDB
Mongoose
JWT
Joi
Swagger / OpenAPI
Cloudinary
Helmet
express-rate-limit
```

## Production Snapshot

| Metric | Result |
|---|---:|
| API endpoints | **85+** |
| Members | **200+** |
| Collections | **12** |
| Services | **17** |
| Test suites | **60+** |
| Test coverage | **95%+** |
| Security layers | **7** |
| Trusted media hosts | **11** |

## Engineering Areas

The case study covers:

- REST API architecture
- Authentication
- Authorization
- RBAC
- Service-layer architecture
- MongoDB data modeling
- Security middleware
- Media processing
- API documentation
- Testing
- Operations
- Performance
- Error handling

The portfolio's endpoint explorer uses curated mock responses for demonstration and clearly identifies them as such.

---

# 🧪 Testing

The application is tested against the **production build**, not only the development server.

## Playwright

The E2E suite contains **13 smoke scenarios**, covering:

- Hero metrics
- Skip-link focus
- Theme switching
- Theme persistence
- English ↔ Arabic switching
- Command palette
- Keyboard navigation
- Terminal shortcuts
- Konami Code
- Unlock persistence
- `tel:` links
- `/links` cards
- Bilingual 404 behavior
- Print emulation

## Accessibility

Six axe-core sweeps cover:

```text
/
/ar
/work/trosc
/links
Command Palette
Developer Terminal
```

The profile-photo 10-click interaction and audio behavior remain manual tests by design.

---

# 🤖 Continuous Integration

Every push and pull request runs:

```text
npm ci
   ↓
Typecheck
   ↓
Lint
   ↓
Production Build
   ↓
Lighthouse CI
   ↓
Playwright E2E
```

## Lighthouse Gates

| Metric | Required |
|---|---:|
| Performance | **≥ 95** |
| Accessibility | **100** |
| Best Practices | **100** |
| SEO | **100** |

Lighthouse reports and Playwright traces are uploaded as CI artifacts.

Configuration lives in:

```text
lighthouserc.json
```

---

# 📡 GitHub Integration

The portfolio dynamically loads public repositories from the configured GitHub account.

The integration:

1. Fetches public repositories.
2. Filters forks and archived repositories.
3. Sorts by stars and recent activity.
4. Caches the response for 15 minutes.
5. Retries failed requests up to three times.
6. Aborts requests after 10 seconds.
7. Handles rate limits and offline states.
8. Provides a localized retry experience.

Cache key:

```text
github_repos_enhanced_cache
```

To clear it manually:

```js
localStorage.removeItem("github_repos_enhanced_cache")
```

---

# 🔍 SEO

Every route receives localized metadata.

The SEO layer includes:

- Canonical URLs
- `hreflang`
- `en`
- `ar`
- `x-default`
- Sitemap
- Robots configuration
- JSON-LD `Person`
- Localized Open Graph metadata
- Static 1200×630 OG image

The OG image is generated during the build using `next/og`.

---

# ⚙️ Configuration

| What | Where |
|---|---|
| GitHub username | `lib/github.ts` → `USERNAME` |
| Colors / shadows | `app/globals.css` |
| Links / phone / repositories | `data/site.ts` |
| UI translations | `lib/dictionaries/` |
| Trosc content | `lib/dictionaries/trosc.ts` |
| Lighthouse thresholds | `lighthouserc.json` |
| ESLint | `eslint.config.mjs` |
| Prettier | `.prettierrc.json` |

---

# 🚢 Deployment

## Vercel

The recommended deployment workflow:

```text
GitHub
   ↓
Vercel
   ↓
Automatic deployment
```

1. Push the repository to GitHub.
2. Import it into Vercel.
3. Deploy once.
4. Every future push triggers a deployment.
5. Keep CI green before merging into the production branch.

### Hosting note

Vercel's Hobby plan is intended for personal, non-commercial use. That makes it appropriate for a personal portfolio, while commercial client applications should use a plan or hosting provider whose terms explicitly permit commercial workloads.

Cloudflare Pages with the OpenNext adapter is one alternative worth considering when commercial hosting requirements apply.

---

# ♿ Accessibility

Accessibility is part of the implementation and CI pipeline.

The portfolio provides:

- WCAG AA contrast
- 44px touch targets
- Visible focus indicators
- Skip navigation
- Semantic landmarks
- Keyboard navigation
- Focus management
- `aria-live` announcements
- Correct heading hierarchy
- Combobox/listbox semantics
- Reduced-motion support
- Automated axe-core testing
- Lighthouse accessibility validation

---

# 🛠️ Skills Demonstrated

### Backend

`Node.js` · `Express.js` · `NestJS` · `REST API Design` · `JWT` · `PHP` · `Laravel`

### Databases

`MongoDB` · `Mongoose` · `PostgreSQL` · `MySQL` · `Schema Design` · `Indexing` · `Aggregation`

### Security & API

`Swagger/OpenAPI` · `Joi` · `Helmet` · `express-rate-limit` · `express-mongo-sanitize` · `HPP` · `CORS`

### DevOps & Tooling

`Docker` · `Git` · `GitHub` · `Linux` · `Bash` · `ESLint` · `Prettier`

### Frontend

`Next.js` · `React` · `TypeScript` · `Tailwind CSS` · `Responsive Design`

### Architecture

`MVC` · `Service Layer` · `RBAC` · `Middleware` · `Factory Pattern` · `Data Modeling` · `Clean Architecture`

---

# 💼 Experience

## IT Head & Backend Lead — Trosc Student Club

**Jan 2025 – Present**

Architect and maintain the production REST API built with **Node.js, Express, and MongoDB**, serving 200+ members through 85+ endpoints.

Lead the IT team and contribute to:

- Backend architecture
- API design
- Authentication and authorization
- Security
- Documentation
- Testing
- Technical direction

---

## OOP Instructor — Google Developer Groups on Campus, SCU

**Apr–May 2025**

Taught **C++ and Object-Oriented Programming** to 50+ students during an 8-week program.

---

## HR Coordinator & Member — Mech Hackers Community

Served across two terms, contributing to community activities, events, coordination, and knowledge-sharing initiatives.

---

# 🎓 Education

## B.Sc. Computer Science — Suez Canal University

**4th Year · Class of 2027 · GPA 3.48 / 4.0**

Relevant coursework:

- Software Engineering
- Operating Systems
- Computer Networks
- Data Structures
- Database Systems

---

# 🏆 Certifications

- **Cloud Architecture** — Professional Certification, ITI
- **PHP Web Development** — 120-hour Full Stack Track, ITI
- **Web Development using React JS** — 144-hour Track, ITI · Jul–Aug 2026
- **Certificate of Appreciation** — OOP Instructor, GDG SCU · 2025
- **Vice IT Head Certificate** — Trosc Student Club

---

# 📦 Selected Projects

## `trosc-backend`

Production backend powering the Trosc Student Club platform.

**Node.js · Express · MongoDB · JWT · Joi · Swagger · Cloudinary**

**85+ endpoints · 6 models · 9 services · 200+ users**

[Repository](https://github.com/basem3sam/trosc-backend) · [Case Study](https://basemesam.vercel.app/work/trosc)

---

## `store-advisor`

Cross-source e-commerce monitoring agent currently in development.

**NestJS · PostgreSQL · Redis · Python · Next.js**

**241 tests**

---

## `zabthalahak` — ظبطهالك

Arabic-first RTL platform for a real 3D-printing business.

**React · Vite · Tailwind CSS**

Live frontend with backend currently in development.

---

## `laravel-ecommerce-app`

Full-stack e-commerce application.

**PHP · Laravel · MySQL**

---

## `neuroscan-ai`

Third-year team project for brain-tumor detection using ensemble models.

**Python · PyTorch · OpenCV**

---

# 🕹️ Hidden Developer Terminal

There is a hidden developer terminal inside the portfolio.

Finding it is part of the experience.

### Hints

> The profile photo is more interactive than it looks.

> A legendary 1980s gaming sequence still works.

> `Ctrl + Shift + B` is quicker.

<details>
<summary><strong>⚠️ Solution — Spoilers</strong></summary>

### Method 1

Click the profile photo **10 times**.

### Method 2

Enter the Konami Code:

```text
↑ ↑ ↓ ↓ ← → ← → B A
```

### Method 3

Press:

```text
Ctrl + Shift + B
```

The terminal includes:

```text
help
about
skills
projects
contact
secret
matrix
hack
coffee
whoami
clear
exit
```

It also features command history, sound effects, achievements, confetti effects, and a mobile-friendly keypad.

</details>

---

# 👨‍💻 About Me

I'm a backend developer and fourth-year Computer Science student at **Suez Canal University**.

I build production APIs with **Node.js, Express, MongoDB, and REST**, with a strong focus on architecture, security, testing, and maintainability.

Currently, I lead the IT team and backend development at **Trosc Student Club**, where I architect and maintain a production API serving 200+ members.

I care about the parts of engineering that are easy to overlook:

> **Clean architecture.  
> Security.  
> Testing.  
> Documentation.  
> Maintainability.**

The goal isn't simply to make software work.

**The goal is to build software that another engineer can understand, trust, and extend.**

---

# 📞 Connect

- 📧 **Email:** [basem.esam.omar@gmail.com](mailto:basem.esam.omar@gmail.com)
- 💼 **LinkedIn:** [linkedin.com/in/BasemEsam](https://linkedin.com/in/BasemEsam)
- 🐙 **GitHub:** [github.com/basem3sam](https://github.com/basem3sam)
- 🌐 **Portfolio:** [basemesam.vercel.app](https://basemesam.vercel.app/)
- 📱 **Phone:** [+20 112 350 5981](tel:+201123505981)

📍 **Port Said, Egypt**

💼 Open to **backend internships, junior backend roles, freelance work, and remote opportunities worldwide**.

---

## 📄 License

MIT — see [**LICENCE**](LICENCE).

---

<p align="center">
  <strong>Built with code, curiosity, and a questionable amount of debugging.</strong>
</p>