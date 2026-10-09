<div align="center">

# Basem Esam

**Backend Engineer · Computer Science Student · Builder**

I build production-minded APIs and developer-focused web experiences, with an emphasis on clean architecture, security, and maintainability.

[![Live Portfolio](https://img.shields.io/badge/Portfolio-Live%20Demo-0D9488?style=for-the-badge)](https://basemesam.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-basem3sam-181717?style=for-the-badge&logo=github)](https://github.com/basem3sam)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/BasemEsam)

**English / العربية** · Responsive design · Light and dark themes · Accessibility-minded

</div>

---

## Overview

This repository contains my personal portfolio: a bilingual, responsive website showcasing my engineering work, technical interests, experience, and projects. It combines a clean presentation layer with interactive details—including a command palette, live GitHub repository data, a Trosc backend case study, and a hidden developer-terminal Easter egg.

The project is built with **Next.js, React, TypeScript, and Tailwind CSS**. It is designed to be usable with a keyboard, touch input, assistive technologies, and reduced-motion preferences.

## Highlights

- **Bilingual experience:** English and Arabic interfaces, including right-to-left layout and localized content.
- **Interactive command palette:** Use `Ctrl/Cmd + K` to navigate sections, change themes or language, and access selected actions.
- **Theme system:** Light and dark themes with persisted preference and system-theme fallback.
- **Backend case study:** A dedicated Trosc page with architecture context and an endpoint explorer using clearly identified simulated responses.
- **GitHub integration:** Displays public repository information with caching, retry handling, and graceful error states.
- **Hidden developer terminal:** A multi-step Easter egg with keyboard and pointer/touch-friendly access paths.
- **Accessibility:** Semantic structure, keyboard-operable overlays, visible focus states, and reduced-motion support.
- **SEO and sharing:** Localized metadata, canonical and alternate-language links, sitemap, robots rules, structured data, and a generated Open Graph image.
- **Print support:** A print stylesheet that prioritizes readable content and hides nonessential interface elements.

## Explore the site

| Page | Description |
| --- | --- |
| [Portfolio](https://basemesam.vercel.app/) | Main English portfolio |
| [Arabic portfolio](https://basemesam.vercel.app/ar) | Arabic interface with RTL layout |
| [Links page](https://basemesam.vercel.app/links) | Quick access to selected profiles and contact links |
| [Trosc case study](https://basemesam.vercel.app/work/trosc) | Backend project overview and endpoint explorer |
| [Source code](https://github.com/basem3sam/portfolio) | Browse the repository |

> Routes and deployment URLs are based on the project's documented setup. If the deployment domain or route structure changes, update this table accordingly.

## Tech stack

| Area | Technologies |
| --- | --- |
| Framework | Next.js App Router |
| UI | React |
| Language | TypeScript with strict checking |
| Styling | Tailwind CSS |
| Typography | IBM Plex Sans, Arabic sans-serif, and a self-hosted JetBrains Mono variant for terminal rendering |
| Icons | Inline SVG icon components |
| External data | GitHub REST API |
| Testing | Playwright and axe-core |
| Code quality | ESLint and Prettier |
| Performance checks | Lighthouse CI |
| Browser effects | Web Audio API and Web Animations API |

The project keeps runtime dependencies focused on the framework and UI libraries; development and verification tools are configured separately.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) **20.9 or newer**
- npm
- Internet access for the initial build if `next/font` needs to fetch and self-host remote fonts

### Install and run locally

```bash
git clone https://github.com/basem3sam/portfolio.git
cd portfolio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To run the browser tests, install Playwright's Chromium browser if it is not already available:

```bash
npx playwright install chromium
```

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | Run TypeScript checks without emitting files |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Apply supported ESLint fixes |
| `npm run format` | Format files with Prettier |
| `npm run format:check` | Check formatting without changing files |
| `npm test` | Run the Playwright end-to-end suite |
| `npm run test:ui` | Run the Playwright suite with its UI, if configured |
| `npm run lighthouse` | Run the configured Lighthouse CI checks |

Refer to `package.json` for the definitive list of scripts and their current behavior.

## Project structure

```text
portfolio/
├── app/
│   ├── [lang]/                 # Locale-aware layouts and pages
│   │   ├── (site)/             # Main portfolio experience
│   │   ├── (links)/            # Links page
│   │   ├── work/trosc/         # Trosc case study
│   │   ├── layout.tsx          # Locale, fonts, metadata, and root UI setup
│   │   └── opengraph-image.tsx # Social sharing image
│   ├── fonts/                  # Self-hosted terminal font assets
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── behavior/               # Theme, scrolling, and reveal behavior
│   ├── case-study/             # Case-study components
│   ├── easter-egg/             # Hidden terminal and access UI
│   ├── github/                 # GitHub repository integration
│   ├── layout/                 # Navigation, footer, and shared layout
│   ├── links/                  # Link-card components
│   ├── palette/                # Command palette
│   ├── sections/               # Portfolio sections
│   ├── seo/                    # Structured data
│   └── ui/                     # Reusable UI components
├── data/                       # Site and case-study data
├── lib/
│   ├── dictionaries/           # English and Arabic content
│   ├── github.ts               # GitHub API client and cache
│   ├── i18n.ts                 # Locale helpers
│   ├── sounds.ts
│   ├── effects.ts
│   └── terminalCommands.ts     # Terminal commands and aliases
├── public/
│   └── assets/                 # Images, icons, and CV assets
├── tests/                      # Playwright and accessibility tests
├── .github/workflows/          # CI workflow definitions
├── proxy.ts                    # Locale URL rewriting
├── playwright.config.ts
├── lighthouserc.json
└── package.json
```

This tree highlights the main areas of the application; consult the repository for the complete file layout.

## Architecture and implementation

### Routing and localization

The site provides English and Arabic experiences. English routes are available without an `/en` prefix, while Arabic routes use `/ar`. The locale-aware layout sets the document language and text direction, and the interface uses logical CSS properties to support RTL layouts.

The links page and Trosc case study are available in both locales. Routing and redirects are configured in the application and Next.js configuration.

### Themes and visual design

The theme system offers a warm, light **Alabaster** palette and a dark **Midnight** palette. Theme preferences are persisted locally, with a system-preference fallback. Theme tokens are defined centrally, and the interface includes restrained texture, ambient gradients, layered card shadows, and a glass-style navigation bar.

### Command palette

The command palette provides a keyboard-friendly way to move around the site and reach common actions. Open it with `Ctrl + K` on Windows/Linux or `⌘ + K` on macOS. It supports keyboard navigation and can be opened from the site's navigation controls.

### GitHub data

The portfolio reads public repository information through the GitHub REST API. The integration includes caching, retries, timeouts, and user-facing error states for situations such as rate limits or network failures.

### Trosc case study

The case study explains the Trosc backend and provides an endpoint explorer for browsing API examples. Explorer responses are simulated examples rather than live execution of every endpoint; consult the linked API documentation or repository for implementation details.

### Search and social sharing

The project includes localized metadata, canonical and alternate-language references, a sitemap, robots configuration, structured person data, and a generated Open Graph image for link previews.

## The hidden Terminal Easter egg

The portfolio includes a hidden developer terminal intended to reward exploration.

- The profile image can reveal the **Konami Master Code** window.
- That window provides the answer and a clue; revealing it is **not the same as activating the Terminal**.
- The Terminal has separate activation paths, including keyboard-based and interface-based routes.
- The terminal interface includes typed output, a touch-friendly keypad, and command aliases for Arabic users.

Try exploring the interface and its keyboard shortcuts to discover the available paths. This section intentionally describes the experience without publishing every solution.

## Testing and quality checks

The repository uses Playwright for end-to-end browser tests and axe-core for automated accessibility checks. The test suite covers important navigation, theme, localization, overlay, Easter egg, and responsive-layout behavior.

Install Chromium when required:

```bash
npx playwright install chromium
```

Run the suite:

```bash
npm test
```

Other useful checks:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Run Lighthouse CI using the configured script:

```bash
npm run lighthouse
```

Test counts, accessibility results, and Lighthouse scores can change as the code evolves. Use the latest local or CI run as the source of truth for current results.

## Continuous integration

The GitHub Actions workflow runs the quality checks configured for the repository, which may include dependency installation, type checking, linting, building, Lighthouse CI, and Playwright tests. See `.github/workflows/` and `lighthouserc.json` for the exact jobs and enforced thresholds.

## Configuration and customization

| What to change | Where to look |
| --- | --- |
| Site links and contact details | `data/site.ts` |
| Trosc case-study data | `data/trosc.ts` and the relevant dictionaries |
| English and Arabic interface text | `lib/dictionaries/` |
| GitHub username and repository fetching | `lib/github.ts` |
| Theme colors and visual tokens | `app/globals.css` |
| Terminal commands and aliases | `lib/terminalCommands.ts` |
| Terminal font files | `app/fonts/` |
| Lighthouse thresholds | `lighthouserc.json` |
| Formatting and lint rules | `.prettierrc.json` and `eslint.config.mjs` |

Check the relevant source file before changing configuration; some behavior is shared across locales or components.

## Deployment

The portfolio is configured for deployment on Vercel.

1. Push the repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Keep the build settings aligned with the project's Next.js configuration.
4. Deploy and verify the English and Arabic routes, links page, case study, theme switching, and Terminal interactions.

Review the current hosting provider's plan terms before using it for commercial client work. Hosting-plan rules can change.

## Accessibility

Accessibility is part of the interface design, not an afterthought. The project includes:

- Keyboard navigation and visible focus indicators.
- A skip link and semantic page landmarks.
- Accessible overlay behavior and live announcements where appropriate.
- Touch-friendly controls.
- Reduced-motion handling.
- Automated accessibility checks in the browser test suite.

Automated tools help identify issues but do not replace manual keyboard and screen-reader testing.

## Troubleshooting

**The site returns a 404 for an expected route**

Restart the development server and verify the locale-routing configuration, including `proxy.ts` and the relevant route files.

**Fonts fail during the first build**

Check the network connection if `next/font` needs to fetch remote font files. Retry the build after connectivity is restored.

**Terminal box-drawing characters do not align**

Verify that the expected JetBrains Mono font files exist under `app/fonts/` and are loading correctly. A fallback font can render box-drawing glyphs at different widths.

**The GitHub repository section fails to load**

Check connectivity and GitHub API rate limits. The integration includes retry and error handling; inspect the browser console and network response for the specific cause.

**Playwright tests fail before running**

Confirm dependencies are installed and the configured browser is available. Install Chromium with `npx playwright install chromium`, then review the first build or browser error in the test output.

**Formatting or lint checks fail**

Run the corresponding script and review the reported file and line. Use `npm run format` or `npm run lint:fix` where appropriate, then inspect the resulting diff.

## About me

I'm a Computer Science student at **Suez Canal University in Port Said, Egypt**, focused on backend engineering and building reliable software. I enjoy working on APIs, authentication and authorization, data modeling, application security, and maintainable architecture.

My portfolio highlights work across backend systems, full-stack applications, and collaborative projects.

## Experience

### IT Leadership & Backend — TROSC Student Club

Lead IT work and backend development for the student club, including a REST API with authentication, role-based access control, security controls, and API documentation.

### Object-Oriented Programming Instructor — Google Developer Groups on Campus, SCU

Taught C++ and object-oriented programming to students during an instructor program in 2025.

### HR Coordinator & Member — Mech Hackers Community

Contributed to community activities across two terms as an HR coordinator and member.

## Education and certifications

**B.Sc. in Computer Science** — Suez Canal University  
Class of 2027 · GPA: 3.48/4.0

Selected coursework includes software engineering, operating systems, computer networks, data structures, and database systems.

Certifications and training listed in the portfolio include:

- Cloud Architecture — Information Technology Institute (ITI)
- PHP Web Development — ITI
- Web Development using React JS — ITI
- Certificate of Appreciation — OOP Instructor, GDG SCU
- Vice IT Head Certificate — TROSC Student Club

## Selected projects

| Project | Description |
| --- | --- |
| [TROSC Backend](https://github.com/basem3sam/trosc-backend) | REST API for a student club, with authentication, role-based access control, security middleware, and API documentation. |
| Store Advisor | An in-development project exploring e-commerce monitoring and data-driven recommendations with a multi-service architecture. |
| ظبطهالك (Zabthalahak) | Arabic-first platform for a 3D-printing business, with a custom-request flow and RTL interface. |
| Laravel E-commerce App | E-commerce application built with PHP, Laravel, and MySQL. |
| NeuroScan AI | Team project exploring brain-tumor detection with Python, PyTorch, and OpenCV. |

See the portfolio and linked repositories for the latest project details and availability.

## Connect

- **Portfolio:** [basemesam.vercel.app](https://basemesam.vercel.app/)
- **GitHub:** [basem3sam](https://github.com/basem3sam)
- **LinkedIn:** [Basem Esam](https://linkedin.com/in/BasemEsam)
- **LeetCode:** [Basem_Esam](https://leetcode.com/u/Basem_Esam/)
- **Codeforces:** [BasemEsam](https://codeforces.com/profile/BasemEsam)
- **Email:** Use the contact link on the portfolio for the current address.

I'm open to backend internships, junior backend opportunities, and freelance work, including remote opportunities.

## License

This project is licensed under the MIT License. See [`LICENCE`](./LICENCE) for the full text.
