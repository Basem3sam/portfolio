# 💼 Basem Esam — Portfolio

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://basemesam.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENCE)

> A bilingual (English / العربية) portfolio showcasing my work as a Backend Developer specializing in Node.js, Express, and scalable system architecture. Built with Next.js, React, TypeScript, and Tailwind CSS.

## ✨ Features

- 🌍 **Bilingual with real RTL** — English at `/` and Arabic at `/ar` (same for `/links` and `/ar/links`), each with its own `<html lang>` / `dir`, a language switcher in the navbar, mirrored layout via logical CSS properties, and localized chrome.
- 🎨 **Dual theme system** — light/dark mode with `localStorage` persistence, OS preference fallback, favicon swapping, and no flash of the wrong theme (`Ctrl/Cmd + Shift + D`).
- ♿ **Accessible** — skip link, semantic landmarks, ARIA labels, keyboard navigation, focus management, 44px touch targets, and reduced-motion support.
- 📡 **Live GitHub integration** — real-time project showcase via the GitHub API, with caching, retries, and graceful error states.
- ⚡ **Server-rendered** — static sections are React Server Components; only interactive pieces ship client JavaScript.
- 🧹 **Code quality** — ESLint 9 (`eslint-config-next`) + Prettier with automatic Tailwind class sorting.
- 🔗 **Links page** — a link-in-bio style page at `/links` (and `/ar/links`).
- 🕹️ **Hidden developer terminal** — a secret easter egg with a Konami code, a mobile keypad, sounds, and celebration effects.

## 🧱 Built With

| Area | Technology |
|------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) (strict) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Fonts | IBM Plex Sans / Sans Arabic / Mono via `next/font` (self-hosted, OFL) |
| Icons | Inline SVG set (`components/ui/Icon.tsx`) for site chrome; Font Awesome 6 (npm) for legacy sections and the easter egg |
| Data | [GitHub REST API](https://docs.github.com/en/rest) |
| Audio and effects | Web Audio API, Web Animations API |

## 🚀 Getting Started

### Requirements

- Node.js 20.9 or newer
- npm
- Internet access on the first `npm run build` (fonts are downloaded and self-hosted by `next/font`, then cached)

### Install and Run

```bash
git clone https://github.com/basem3sam/portfolio.git
cd portfolio
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Scripts

| **Command** | **Description** |
|---|---|
| **`npm run dev`** | Start the development server |
| **`npm run build`** | Create a production build |
| **`npm start`** | Serve the production build |
| **`npm run typecheck`** | Run the TypeScript compiler without emitting files |
| **`npm run lint`** | Lint the project with ESLint |
| **`npm run lint:fix`** | Lint and auto-fix |
| **`npm run format`** | Format the whole project with Prettier |
| **`npm run format:check`** | Check formatting without writing |

## 📂 Project Structure

```text
portfolio/
├── app/
│   ├── [lang]/                  # Locale segment: "en" and "ar"
│   │   ├── layout.tsx           # Root layout: <html lang/dir>, fonts, theme script, global behaviors
│   │   ├── not-found.tsx        # Bilingual 404 page
│   │   ├── (site)/              # Portfolio (/en and /ar): navbar, footer, easter egg
│   │   └── (links)/links/       # Link-in-bio page (/en/links and /ar/links)
├── components/
│   ├── layout/                  # Navbar, LanguageSwitcher, footer, back-to-top, skip link
│   ├── sections/                # Hero, About, Skills, Experience, Projects, Education, Contact
│   ├── ui/                      # Icon (inline SVG set), buttons, badges, cards, section title
│   ├── behavior/                # Theme, scroll, and reveal-on-scroll behavior
│   ├── github/                  # GitHub projects section
│   ├── links/                   # Links page components
│   └── easter-egg/              # Hidden developer terminal and overlays
├── data/
│   └── site.ts                  # Shared URLs and constants
├── lib/
│   ├── i18n.ts                  # Locale helpers and dictionary loader
│   ├── dictionaries/            # en.ts and ar.ts UI strings
│   ├── theme.ts / scroll.ts / github.ts / sounds.ts / effects.ts / ...
├── proxy.ts                     # Rewrites "/" and "/links" to "/en/..." (URL stays clean)
├── public/assets/               # Images, icons (light/dark), CV
├── eslint.config.mjs            # ESLint 9 flat config (eslint-config-next)
├── .prettierrc.json             # Prettier + Tailwind class sorting
├── next.config.ts               # Redirects and security headers
└── postcss.config.mjs           # Tailwind PostCSS plugin
```

## 🔧 How It Works

### Routing and Languages

English lives at `/` and Arabic at `/ar` (and `/links` / `/ar/links`).

the URL never shows `/en`: `proxy.ts` internally rewrites unprefixed paths to the English routes, so every existing link to `basemesam.vercel.app/` keeps working with zero redirects.

`next.config.ts` still redirects the legacy URLs `/index.html` → `/` and `/links.html` → `/links`, and adds security headers:

- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

Unmatched URLs render the bilingual 404 page with a proper `404` status.

### Internationalization

UI strings live in:

```text
lib/dictionaries/en.ts
lib/dictionaries/ar.ts
```

The dictionaries are typed against the English dictionary, so a missing key is a compile-time error.

The root layout sets `<html lang>` and `dir` per locale.

Arabic pages load IBM Plex Sans Arabic, while English pages load IBM Plex Sans. Positioning uses logical properties (`start-*`, `end-*`, `me-*`, `rtl:` variants) so the layout mirrors correctly in RTL.

The navbar language switcher swaps between the current page's locales and carries `hreflang` hints.

### Styling

All styling uses Tailwind CSS v4.

`app/globals.css` contains:

- Design tokens (`--c-*`, `--sh-*`)
- Keyframes
- Base styles

Tokens are CSS variables on `:root`, overridden under `.dark-mode`, so components switch themes automatically.

The Tailwind `dark:` variant is wired to the same class.

### Theme

The selected theme is stored under the `theme` key in `localStorage` and applied as a dark-mode class on `<body>` before first paint.

It can be toggled from:

- The navbar
- The links page
- `Ctrl/Cmd + Shift + D`

Favicons also swap with the active theme.

### Build Info

The footer shows a build `<sha>` chip read from `VERCEL_GIT_COMMIT_SHA`, which Vercel provides automatically at build time.

No additional setup is required, and the variable is not a secret.

Locally, it falls back to `build dev`.

### GitHub Integration

The portfolio fetches public repositories for the configured user and:

- Hides forks and archived repositories
- Sorts by stars, then last update
- Caches results in `localStorage` for 15 minutes
- Uses the `github_repos_enhanced_cache` cache key
- Retries requests up to 3 times
- Times out after 10 seconds
- Shows friendly errors with a retry button

## ⚙️ Configuration

| Configuration | Location |
|---|---|
| GitHub username | `lib/github.ts` → `const USERNAME` |
| Colors and shadows | `app/globals.css` → `:root` / `.dark-mode` |
| Links and contact details | `data/site.ts` |
| UI text (EN/AR) | `lib/dictionaries/` |
| ESLint rules | `eslint.config.mjs` |
| Prettier configuration | `.prettierrc.json` |

## 🚢 Deployment

### Vercel

[Vercel](https://vercel.com/) is the recommended deployment platform.

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Vercel automatically builds and deploys the project.

Preview deployments run automatically for every branch and pull request.

## ♿ Accessibility

The portfolio includes:

- Skip-to-content link
- Semantic landmarks
- Descriptive localized `aria-label`s
- `aria-expanded` / `aria-current`
- Focus outlines
- Focus management for anchor navigation
- Keyboard navigation
- 44px touch targets
- `prefers-reduced-motion` support

Animations, smooth scrolling, and sound are gated behind user interaction where appropriate, and everything respects `prefers-reduced-motion`.

## 🐛 Troubleshooting

### Fonts fail on first build

`next/font` downloads font files during the first build.

Ensure network access, then retry:

```bash
npm run build
```

### `/` returns 404 in development

The proxy rewrite may not have run correctly.

Restart the development server:

```bash
npm run dev
```

If it persists, report the issue. On newer Next.js versions, the middleware file may need to be migrated to `proxy.ts`.

### GitHub Projects are not loading

Check the GitHub username in:

```text
lib/github.ts
```

Also check for GitHub API rate limits.

To clear the cache:

```js
localStorage.removeItem("github_repos_enhanced_cache");
```

### Dark mode is not persisting

Check `localStorage` permissions.

To reset the stored theme:

```js
localStorage.removeItem("theme");
```

### Lint errors after installing

Paste the errors into the redesign issue.

Warnings in legacy sections are expected to be cleaned up stage by stage.

## 🛠️ Skills Showcased

### Backend

- Node.js
- Express.js
- RESTful API design
- Authentication & Authorization
- PHP
- Laravel

### Databases

- MongoDB
- Mongoose
- MySQL
- Redis
- Caching

### DevOps & Tools

- Docker
- Kubernetes
- Git & GitHub
- Linux administration
- Bash scripting

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Responsive design

### System Design

- OOP
- Clean architecture
- Design patterns
- Scalable systems

## 💼 Experience

### IT Head & Backend Lead — TROSC Student Club
**2025 – Present**

Leading backend development for the club's platform using Node.js, Express, and MongoDB while heading the IT team.

### OOP Instructor — Google Developer Groups on Campus (GDG SCU)
**April – May 2025**

Taught C++ and object-oriented programming to 50+ students over 8 weeks.

### HR Coordinator (Two Terms) & Member — Mech Hackers Community

Contributed to community events, hackathons, and knowledge sharing.

## 🎓 Education

### Bachelor of Computer Science — Suez Canal University

**4th year · Expected graduation: 2027 · GPA: 3.48/4.0**

Computer Science student with experience in backend development, competitive programming, technical education, and student-community leadership.

## 🕹️ The Hidden Terminal

This portfolio contains a hidden developer terminal.

Finding it proves you think like a developer. 👀

### Hints

- Interactive elements sometimes hide more than they seem.
- A legendary 1980s gaming sequence still works.
- Keyboard warriors should try `Ctrl + Shift + B`.
- The profile photo is more interactive than it appears.

<details>
<summary><strong>Full solution (spoilers)</strong></summary>

<br>

You can unlock the terminal in several ways:

1. Click the profile photo in the hero **10 times** at a calm pace for progressive hints.
2. Type the Konami code:

   ```text
   ↑ ↑ ↓ ↓ ← → ← → B A
   ```

3. Press:

   ```text
   Ctrl + Shift + B
   ```

Inside are **12 commands**:

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

The terminal also includes:

- Web Audio sounds
- Confetti and achievement effects
- Command history
- A mobile Konami keypad

</details>

## 👨‍💻 About Me

I'm a Backend Developer and 4th-year Computer Science student at Suez Canal University, class of 2027, specializing in Node.js, Express, and scalable system architecture.

Currently, I'm IT Head & Backend Lead at TROSC Student Club and a former OOP Instructor at GDG SCU.

## 📞 Connect With Me

- **Email:** [basem.esam.omar@gmail.com](mailto:basem.esam.omar@gmail.com)
- **LinkedIn:** [linkedin.com/in/BasemEsam](https://linkedin.com/in/BasemEsam)
- **GitHub:** [github.com/basem3sam](https://github.com/basem3sam)
- **Portfolio:** [basemesam.vercel.app](https://basemesam.vercel.app/)

📍 Port Said, Egypt · 💼 Open to internships, junior backend roles, and freelance work — remote worldwide or on-site in Egypt.