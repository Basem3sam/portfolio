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

## 🎁 Easter Egg

> **Secret Hint:** Look for the hidden message in the console when you visit the live site. Type `portfolio.secret()` in the browser console for a surprise! 🎉

<details>
<summary>🔍 Want to know what it is?</summary>

The portfolio includes a hidden interactive terminal-style console game that showcases my personality and technical skills. It's a fun way for recruiters and fellow developers to discover more about me beyond the traditional resume format!

**How to unlock:**
1. Visit the live site
2. Open browser DevTools (F12)
3. Type `portfolio.secret()` in the Console
4. Follow the prompts and enjoy!

Features include:
- ASCII art greeting
- Interactive commands (`help`, `about`, `skills`, `projects`, `joke`)
- Hidden achievements system
- Konami code easter egg
- Terminal-style interface

*This demonstrates my attention to detail and ability to create engaging user experiences, even in unexpected places!*
</details>
