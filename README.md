# 💼 Basem Esam - Portfolio

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://basemesam.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Pages-181717?style=for-the-badge&logo=github)](https://basem3sam.github.io/portfolio/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> A modern, responsive portfolio showcasing my journey as a Backend Developer specializing in Node.js, Express, and scalable system architecture.

## ✨ Features

- 🎨 **Dual Theme System** - Seamless light/dark mode with localStorage persistence
- 📱 **Fully Responsive** - Optimized for all devices (320px to 4K)
- ♿ **Accessible** - WCAG 2.1 AA compliant with keyboard navigation
- 📡 **Live GitHub Integration** - Real-time project showcase via GitHub API
- ⚡ **High Performance** - Lighthouse score 95+, vanilla JavaScript (no frameworks)
- 🎭 **Smooth Animations** - Intersection Observer API with custom easing

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/basem3sam/portfolio.git
cd portfolio

# Start local server (choose one)
python -m http.server 8000
# or
npx serve . -p 8000

# Open in browser
http://localhost:8000
```

> **Note:** A local server is required for GitHub API functionality to work properly.

## 🛠️ Tech Stack

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
- HTML5, CSS3, JavaScript ES6+
- Bootstrap 5
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

## 📂 Project Structure

```
portfolio/
├── index.html              # Main HTML file
├── css/
│   ├── style.css          # Core styles
│   ├── dark-mode.css      # Dark theme
│   └── bootstrap-custom.css
├── js/
│   ├── main.js            # App initialization
│   ├── smooth-scroll.js   # Navigation
│   ├── github-api.js      # GitHub integration
│   └── dark-mode.js       # Theme toggle
└── assets/
    ├── images/            # Profile & projects
    └── icons/             # Favicons (light/dark)
```

## ⚙️ Configuration

### Update GitHub Username

```javascript
// js/github-api.js
const GITHUB_CONFIG = {
  username: 'YOUR_GITHUB_USERNAME', // Change this
  reposPerPage: 9,
  sortBy: 'updated',
};
```

### Customize Theme Colors

```css
/* css/style.css */
:root {
  --primary-color: #2c3e50;
  --secondary-color: #3498db;
  --accent-color: #e74c3c;
}
```

## 🚢 Deployment

### Netlify (Recommended)
1. Push to GitHub
2. Connect repository on [Netlify](https://vercel.com)
3. Deploy automatically

### GitHub Pages
```bash
# Enable in Settings → Pages
# Source: Deploy from branch (main, root)
# Access at: https://YOUR_USERNAME.github.io/portfolio/
```

## 📊 Performance

| Metric | Score |
|--------|-------|
| Performance | 96/100 |
| Accessibility | 98/100 |
| Best Practices | 100/100 |
| SEO | 100/100 |
| LCP | 1.2s |
| FID | 45ms |

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

## 🐛 Troubleshooting

**GitHub Projects Not Loading?**
- Verify GitHub username in `js/github-api.js`
- Ensure local server is running
- Check browser console for errors
- Clear localStorage cache: `localStorage.removeItem('github_repos_cache')`

**Dark Mode Not Persisting?**
- Check localStorage permissions in browser
- Clear and reset: `localStorage.removeItem('theme')`

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs via [Issues](https://github.com/basem3sam/portfolio/issues)
- Suggest features or improvements
- Submit pull requests

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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

</div>

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
1. Click the profile image multiple times (10 clicks total)
2. Watch as progressive hints reveal themselves
3. Follow the clues to discover the legendary Konami Code
4. Enter the sequence: `↑ ↑ ↓ ↓ ← → ← → B A`
5. Unlock the terminal and celebrate! 🎉

**Method 2: Quick Access** (For those who know)
- Press `Ctrl + Shift + B` to instantly open the terminal

**Method 3: Classic Konami Code**
- Just type the legendary sequence: `↑ ↑ ↓ ↓ ← → ← → B A`

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
- And more!

**Special Features:**
- 🎨 ASCII art animations
- 🎵 Interactive sound effects (Web Audio API)
- ✨ Celebration confetti and particles
- 🏆 Achievement system
- 📱 Mobile-optimized interface
- 🎭 Matrix-style glitch effects

### 🛠️ Technical Implementation:

**Built With:**
- Pure Vanilla JavaScript (700+ lines)
- Web Audio API for real-time sound synthesis
- Custom Konami code state machine
- Performance-monitored particle system
- Anti-spam protection with rate limiting
- SessionStorage for progress persistence

**Code Stats:**
- 15+ interactive terminal commands
- 10 progressive hint levels
- 50+ particles per celebration
- 8 unique sound frequencies
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

---

**Ready to explore?** Visit the [live site](https://basemesam.vercel.app/) and start your journey! 🎯
