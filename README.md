# 💼 Basem Esam - Portfolio

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://basemesam.netlify.app/)
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
2. Connect repository on [Netlify](https://netlify.com)
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
[![Portfolio](https://img.shields.io/badge/Portfolio-Live%20Site-brightgreen?style=for-the-badge&logo=google-chrome&logoColor=white)](https://basemesam.netlify.app/)

**📍 Location:** Port Said, Egypt | **💼 Status:** Open to opportunities

</div>

---

<div align="center">

**Built with ❤️ by [Basem Esam](https://github.com/basem3sam)**

⭐ Star this repo if you found it helpful!

</div>

🎮 Easter Egg Hunt

Hidden Feature Alert! There's a secret developer terminal hidden in this portfolio. Can you find it? 🔍

🎯 Multiple Ways to Unlock:
Method 1: The Classic Konami Code ⭐ (10-Click Challenge)

Click the profile image 10 times to discover progressive hints
Each click reveals more about the legendary gaming sequence
Complete the journey to become a "Konami Code Master"
Final unlock: Enter the classic code ↑ ↑ ↓ ↓ ← → ← → B A

Method 2: Keyboard Shortcut ⚡

Press Ctrl + Shift + B to instantly open the terminal
Works on both desktop and mobile devices

Method 3: Direct Konami Code 🎮

Type the legendary sequence: ↑ ↑ ↓ ↓ ← → ← → B A
Desktop only - Mobile users use Method 1 instead!

🎨 What You'll Discover:
Once unlocked, you'll access a fully functional developer terminal with:
Interactive Commands:

help - See all available commands
about - Learn about me beyond the resume
skills - View technical skills with progress bars
projects - Explore featured projects
contact - Get contact information
secret - Unlock the ultimate secret message
matrix - Activate Matrix mode with glitch effects
hack - Run a humorous hacking simulation
coffee - Get a virtual coffee break ☕
whoami - Display your hacker status
clear - Clear terminal output
exit - Close the terminal

Special Features:

🎨 ASCII art logo and animations
🎵 Interactive sound effects (Web Audio API)
✨ Celebration animations with confetti & particles
🏆 Achievement system for completionists
📱 Fully responsive mobile interface with custom keyboard
💾 Progress persistence with sessionStorage
🎭 Matrix-style glitch effects
🔊 Directional particle effects synced to clicks

🏆 Achievement System:
Terminal Explorer - Find and open the terminal
Konami Master - Complete the 10-click discovery journey
Command Specialist - Use 5+ different terminal commands
Curious Developer - Discover all hidden features
🛡️ Anti-Spam Protection:
The easter egg includes intelligent rate-limiting to prevent spam:

Maximum 3 clicks per second
Automatic sequence reset after 5 seconds of inactivity
Friendly warnings if clicking too fast
Performance monitoring to maintain smooth experience

💡 Why This Easter Egg?
This hidden terminal demonstrates:

Attention to Detail - Every interaction is carefully crafted
Technical Creativity - Custom audio, animations, and state management
User Experience Focus - Smooth, delightful, and responsive
Problem-Solving Skills - Complex event handling and edge cases
Passion for Craft - Going beyond requirements to create memorable experiences

<details>
<summary>🎬 Behind the Scenes (Spoiler Alert!)</summary>
Technical Implementation:

Pure Vanilla JavaScript (no frameworks)
Web Audio API for real-time sound synthesis
Intersection Observer for animations
LocalStorage/SessionStorage for persistence
Custom Konami code detector with state machine
Mobile-optimized overlay system
Performance-monitored particle system
Anti-spam protection with intelligent rate limiting

Code Highlights:

700+ lines of easter egg code
15+ interactive terminal commands
Custom audio synthesis for each key press
Responsive mobile keyboard interface
Smart caching and state management
Accessible and keyboard-navigable

Fun Stats:

🎮 Inspired by 1980s Konami games
🎨 50+ particles per celebration
⚡ 10 progressive hint levels
🔊 8 unique sound frequencies
🎯 3 different unlock methods

This easter egg took almost as long to build as the portfolio itself - because the best experiences are in the details! 😄
</details>
