# 💼 Basem Esam - Portfolio

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://basemesam.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENCE)

> A modern, responsive portfolio showcasing my journey as a Backend Developer specializing in Node.js, Express, and scalable system architecture. Built with Next.js, React, TypeScript, and Tailwind CSS.

## 📑 Table of Contents

- [Features](#-features)
- [Built With](#-built-with)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Accessibility](#-accessibility)
- [Troubleshooting](#-troubleshooting)
- [Skills Showcased](#-skills-showcased)
- [Experience](#-experience)
- [Education](#-education)
- [Key Sections](#-key-sections)
- [The Hidden Terminal](#-the-hidden-terminal)
- [Contributing](#-contributing)
- [License](#-license)
- [About Me](#-about-me)
- [Connect With Me](#-connect-with-me)

## ✨ Features

- 🎨 **Dual Theme System** - Light/dark mode with `localStorage` persistence, OS preference fallback, favicon swapping, and no flash of the wrong theme on load
- 📱 **Fully Responsive** - Mobile-first layout with a collapsible mobile menu
- ♿ **Accessible** - Skip link, semantic landmarks, ARIA labels, keyboard navigation, focus management, and reduced-motion support
- 📡 **Live GitHub Integration** - Real-time project showcase via the GitHub API, with caching, retries, and graceful error states
- ⚡ **Server-Rendered** - Static sections are React Server Components; only interactive pieces ship client JavaScript
- 🎭 **Smooth Animations** - Hero intro and scroll-in reveals with Intersection Observer, all disabled for users who prefer reduced motion
- 🧭 **Smart Navigation** - Smooth anchor scrolling with a navbar-aware offset, active section highlighting, and a back-to-top button
- 🔗 **Links Page** - A link-in-bio style page at `/links`
- 🕹️ **Hidden Developer Terminal** - A secret easter egg with a Konami code, a mobile keypad, sounds, and celebration effects

## 🧱 Built With

| Area | Technology |
|------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Icons | [Font Awesome 6](https://fontawesome.com/) (npm package) |
| Data | [GitHub REST API](https://docs.github.com/en/rest) |
| Audio and effects | Web Audio API, Web Animations API |

## 🚀 Getting Started

### Requirements

- Node.js 20.9 or newer
- npm

### Install and run

```bash
# Clone the repository
git clone https://github.com/basem3sam/portfolio.git
cd portfolio

# Install dependencies
npm install

# Start the development server
npm run dev

# Open in browser
http://localhost:3000
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | Run the TypeScript compiler without emitting files |

## 📂 Project Structure

```
portfolio/
├── app/
│   ├── (site)/                 # Portfolio page (/): layout + page
│   ├── (links)/links/          # Links page (/links): layout + page
│   └── globals.css             # Tailwind setup, theme tokens, animations
├── components/
│   ├── layout/                 # Navbar, footer, back-to-top, skip link, floating shapes
│   ├── sections/               # Hero, About, Skills, Experience, Projects, Education, Contact
│   ├── ui/                     # Shared building blocks (buttons, badges, cards, section title)
│   ├── behavior/               # Theme, scroll, and reveal-on-scroll behavior
│   ├── github/                 # GitHub projects section
│   ├── links/                  # Links page components
│   └── easter-egg/             # Hidden developer terminal and overlays
├── data/
│   └── site.ts                 # Shared URLs and constants
├── lib/
│   ├── theme.ts                # Theme state, persistence, favicon swapping
│   ├── scroll.ts               # Scroll helpers
│   ├── github.ts               # GitHub API client, cache, retries, formatters
│   ├── sounds.ts               # Web Audio sounds
│   ├── effects.ts              # Particles, confetti, celebration animations
│   ├── scrollLock.ts           # Body scroll locking for overlays
│   └── terminalCommands.ts     # Terminal command output
├── public/
│   └── assets/                 # Images, icons, favicons (light/dark), CV
├── next.config.ts              # Redirects and security headers
├── postcss.config.mjs          # Tailwind PostCSS plugin
└── tsconfig.json
```

## 🔧 How It Works

### Routing and layouts

- `/` is the portfolio and `/links` is the link-in-bio page. Each lives in its own route group with its own root layout, so their styles and scripts never interfere with each other.
- `next.config.ts` redirects the old URLs `/index.html` and `/links.html` to `/` and `/links`, and adds security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).

### Styling

- All styling is Tailwind CSS. There are no hand-written component stylesheets.
- `app/globals.css` holds the theme tokens (colors, shadows, breakpoints, fonts), keyframes, and a small base layer.
- Colors are CSS variables on `:root` that are overridden under `.dark-mode`, so most components switch themes automatically. The `dark:` variant is wired to the same class.

### Server and client components

- Static content (sections, footer, cards) renders on the server.
- Client components handle only what needs the browser: theme toggle, navbar state, scroll behavior, reveal animations, the GitHub fetch, and the hidden terminal.

### Theme

- The theme is stored under the `theme` key in `localStorage` and applied as a `dark-mode` class on `<body>`. A tiny inline script applies it before first paint.
- Toggle it from the navbar, from `/links`, or with `Ctrl/Cmd + Shift + D`.

### GitHub integration

- Fetches public repositories for the configured user, hides forks and archived repos, and sorts by stars, then by last update.
- Results are cached in `localStorage` for 15 minutes under `github_repos_enhanced_cache`.
- Requests time out after 10 seconds and are retried up to 3 times. Errors (user not found, rate limit, timeout) show friendly messages with a **Try Again** button where it helps.

### Motion

- The hero fades in on load and cards animate into view as you scroll.
- Everything respects `prefers-reduced-motion`.

## ⚙️ Configuration

### Update GitHub username

```typescript
// lib/github.ts
const USERNAME = "YOUR_GITHUB_USERNAME"; // Change this
const REPOS_PER_PAGE = 9;
```

### Customize theme colors

```css
/* app/globals.css */
:root {
  --c-primary: #2c3e50;
  --c-secondary: #3498db;
  --c-accent: #e74c3c;
}

.dark-mode {
  --c-primary: #0f172a;
  --c-secondary: #3b82f6;
  --c-accent: #ef4444;
}
```

### Update links and contact details

Shared URLs (email, LinkedIn, GitHub, CV path, site URL) live in `data/site.ts`. Page metadata (title, description, Open Graph, Twitter, icons) lives in `app/(site)/layout.tsx` and `app/(links)/links/layout.tsx`.

## 🚢 Deployment

### Netlify (Recommended)

1. Push to GitHub
2. Connect the repository on [Netlify](https://www.netlify.com)
3. Deploy automatically (Next.js is detected, Node.js 20.9 or newer)

### Vercel

1. Push to GitHub
2. Import the repository on [Vercel](https://vercel.com)
3. Deploy automatically

> This is a full Next.js app (redirects and headers are configured in `next.config.ts`), so it needs a platform that supports Next.js rather than plain static hosting.

## ♿ Accessibility

- Skip-to-content link and semantic landmarks
- Descriptive `aria-label`s on icon-only controls, with labels that update for the theme toggle
- `aria-expanded` on the mobile menu and `aria-current` on the active section link
- Anchor navigation moves focus to the target section
- `Page Up`, `Page Down`, `Home`, and `End` scroll smoothly (and are ignored inside inputs)
- Visible focus outlines
- Animations and smooth scrolling are disabled for users who prefer reduced motion

## 🐛 Troubleshooting

**GitHub Projects Not Loading?**
- Verify the GitHub username in `lib/github.ts`
- Check the browser console and network tab for errors (unauthenticated GitHub API requests are rate limited)
- Clear the cache: `localStorage.removeItem('github_repos_enhanced_cache')`

**Dark Mode Not Persisting?**
- Check localStorage permissions in the browser
- Clear and reset: `localStorage.removeItem('theme')`

**Styles Not Updating?**
- Restart the dev server after changing `package.json` or `postcss.config.mjs`
- Delete the `.next` folder and run `npm run dev` again

## 🛠️ Skills Showcased

**Backend Development:**
- Node.js, Express.js
- RESTful API Design
- Authentication & Authorization
- PHP, Laravel

**Databases:**
- MongoDB (Mongoose)
- MySQL
- Redis (Caching)

**DevOps & Tools:**
- Docker, Kubernetes
- Git & GitHub
- Linux Administration
- Bash Scripting

**Frontend:**
- Next.js, React, TypeScript
- Tailwind CSS
- Responsive Design

**Programming Languages:**
- JavaScript
- PHP
- Bash/Shell

**System Design:**
- OOP Principles
- Clean Architecture
- Design Patterns
- Scalable Systems

## 💼 Experience

**Vice IT Head** | Trosc Student Club
- *2025 - Present*
- Leading backend development initiatives
- Managing technical team operations
- Overseeing IT infrastructure

**OOP Instructor** | Google Developer Groups
- *2023 - 2024*
- Teaching Object-Oriented Programming fundamentals
- Mentoring beginner developers
- Guiding best practices in software development

**Active Member** | Mech Hackers Community
- *2023 - Present*
- Participating in hackathons and coding challenges
- Contributing to community projects
- Knowledge sharing and collaboration

## 🎓 Education

**Bachelor of Computer Science** | Suez Canal University
- Expected Graduation: 2026/2027
- GPA: 3.48/4.0
- Current: 3rd Year

**Achievements:**
- ICPC Competitive Programmer
- Active in GDG and Mech Hackers communities
- Teaching Assistant for OOP courses

## 🎯 Key Sections

- **Hero** - Introduction with animated background
- **About** - Professional journey and background
- **Skills** - Technical expertise and tools
- **Experience** - Professional timeline
- **Projects** - Portfolio showcase (static + GitHub API)
- **Education** - Academic credentials
- **Contact** - Multiple ways to connect
- **Links** (`/links`) - All important links in one place

## 🕹️ The Hidden Terminal

### 🎯 The Challenge:

This portfolio contains a **hidden developer terminal** that only the most curious will discover. Finding it proves you think like a true developer - always exploring, questioning, and going beyond the surface.

### 💡 Hints (No Spoilers):

1. **Look closely** at interactive elements - sometimes clicking reveals more than you expect
2. **Classic gamers** might recognize a legendary pattern from the 1980s
3. **Keyboard warriors** know that certain key combinations unlock secret powers
4. **The profile section** might be more interactive than it appears...

### 🏆 What Awaits:

Those who discover the secret will unlock:
- A fully functional **interactive terminal**
- Multiple **hidden commands** to explore
- **Celebration effects** and achievements
- Proof that you're a **true developer** at heart

### 🤔 Stuck? Here's Help:

<details>
<summary>Click for Progressive Hints (Mild Spoilers)</summary>

**Hint 1:** Try interacting with the profile image in the hero section. Persistence pays off!

**Hint 2:** There's a famous gaming code from the 1980s that still works today. Gamers know it well.

**Hint 3:** Keyboard shortcut lovers: Try combining Ctrl, Shift, and a letter that starts "Backend"...

**Hint 4:** On mobile? The profile image is your gateway. Keep exploring!

</details>

<details>
<summary>🎬 Full Solution & Behind the Scenes (Major Spoilers!)</summary>

### 🔓 How to Unlock:

**Method 1: The Discovery Journey** (Recommended for first-timers)
1. Click the profile image multiple times (10 clicks total, at a calm pace)
2. Watch as progressive hints reveal themselves
3. Follow the clues to discover the legendary Konami Code
4. Enter the sequence: `↑ ↑ ↓ ↓ ← → ← → B A` (on mobile, tap the clue to open an on-screen keypad)
5. Unlock the terminal and celebrate! 🎉

**Method 2: Quick Access** (For those who know)
- Press `Ctrl + Shift + B` to instantly open the terminal

**Method 3: Classic Konami Code**
- Just type the legendary sequence on a keyboard: `↑ ↑ ↓ ↓ ← → ← → B A`

### 🎨 What's Inside:

**Interactive Terminal Commands:**
- `help` - See all available commands
- `about` - Learn about me beyond the resume
- `skills` - View technical skills with progress bars
- `projects` - Explore featured projects
- `contact` - Get contact information
- `secret` - Unlock the ultimate secret message
- `matrix` - Activate Matrix mode with glitch effects
- `hack` - Run a humorous hacking simulation
- `coffee` - Get a virtual coffee break ☕
- `whoami` - Display your hacker status
- `clear` and `exit` - Tidy up and leave

**Special Features:**
- 🎨 ASCII art banner
- 🎵 Interactive sound effects (Web Audio API)
- ✨ Celebration confetti and particles
- 🏆 Achievement system
- 📱 Mobile-optimized interface with an on-screen Konami keypad
- 🎭 Matrix-style glitch effects
- ⌨️ Command history with the arrow keys

### 🛠️ Technical Implementation:

**Built With:**
- React client components with TypeScript and Tailwind CSS
- Web Audio API for real-time sound synthesis
- Web Animations API for particles and celebration effects
- Custom Konami code state machine
- Performance-capped particle system
- Anti-spam protection with rate limiting
- Scroll locking while overlays and the terminal are open

**Highlights:**
- 12 interactive terminal commands
- Progressive hint levels
- 3 different unlock methods

### 💭 Why This Easter Egg?

This hidden feature demonstrates:
- **Attention to Detail** - Every interaction carefully crafted
- **Technical Creativity** - Custom audio, animations, state management
- **User Experience Focus** - Delightful and responsive
- **Passion for Craft** - Going beyond requirements
- **Problem-Solving Skills** - Complex event handling

*The easter egg took nearly as long to build as the portfolio itself - because the best experiences are in the details! 😄*
</details>

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs via [Issues](https://github.com/basem3sam/portfolio/issues)
- Suggest features or improvements
- Submit pull requests

## 📄 License

This project is licensed under the MIT License - see the [LICENCE](LICENCE) file for details.

## 👨‍💻 About Me

I'm a Backend Developer and Computer Science student at Suez Canal University, specializing in Node.js, Express, and scalable system architecture. Currently serving as Vice IT Head at Trosc Student Club and former OOP Instructor at Google Developer Groups.

**Current Role:**
- 🎓 3rd Year CS Student | GPA: 3.48/4.0
- 💼 Vice IT Head at Trosc Student Club
- 🏆 ICPC Competitive Programmer
- 👨‍🏫 Former OOP Instructor at GDG
- 🚀 Active Member of Mech Hackers Community

**What I Do:**
- Backend Development with Node.js & Express
- REST API Design & Implementation
- System Design & Scalable Architecture
- Database Management (MongoDB, MySQL, Redis)
- DevOps & Containerization (Docker, Kubernetes)

## 📞 Connect With Me

<div align="center">

[![Email](https://img.shields.io/badge/Email-basem.esam.omar%40gmail.com-red?style=for-the-badge&logo=gmail&logoColor=white)](mailto:basem.esam.omar@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Basem%20Esam-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/BasemEsam)
[![GitHub](https://img.shields.io/badge/GitHub-basem3sam-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/basem3sam)
[![Portfolio](https://img.shields.io/badge/Portfolio-Live%20Site-brightgreen?style=for-the-badge&logo=google-chrome&logoColor=white)](https://basemesam.vercel.app/)

**📍 Location:** Port Said, Egypt | **💼 Status:** Open to opportunities

</div>

---

<div align="center">

**Built with ❤️ by [Basem Esam](https://github.com/basem3sam)**

⭐ Star this repo if you found it helpful!

**Ready to explore?** Visit the [live site](https://basemesam.vercel.app/) and start your journey! 🎯

</div>
