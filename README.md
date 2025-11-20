# 💼 Basem Esam - Portfolio Website

<div align="center">

![Portfolio Banner](https://img.shields.io/badge/Portfolio-Live-brightgreen?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

**A modern, responsive portfolio showcasing my journey as a Backend Developer & Computer Science Student**

[View Live Demo](#) • [Report Bug](mailto:basem.esam.omar@gmail.com) • [Request Feature](mailto:basem.esam.omar@gmail.com)

</div>

---

## 🌟 About

This portfolio website represents my professional journey, technical skills, and projects as a Backend Developer specializing in Node.js, Express, and scalable system architecture. Built with modern web technologies and best practices, it showcases my commitment to clean code, responsive design, and exceptional user experience.

## ✨ Key Features

### 🎨 Design & UX

- **Dual Theme System** - Seamlessly switch between light and dark modes with persistent user preference
- **Fully Responsive** - Optimized for all devices from mobile to 4K displays
- **Smooth Animations** - Intersection Observer API for elegant scroll-triggered animations
- **Modern UI/UX** - Clean, professional design with intuitive navigation

### 🚀 Performance

- **Optimized Loading** - Lazy loading for images and content
- **Efficient Code** - Modular JavaScript architecture
- **Fast Rendering** - CSS variables for instant theme switching
- **SEO Ready** - Semantic HTML5 and meta tags

### ♿ Accessibility

- **WCAG 2.1 Compliant** - Level AA standards
- **Keyboard Navigation** - Full site accessibility via keyboard
- **Screen Reader Support** - Proper ARIA labels and semantic markup
- **High Contrast** - Optimized color ratios for readability

### 🔧 Technical Excellence

- **GitHub Integration** - Live project showcase via GitHub API
- **Progressive Enhancement** - Core functionality works without JavaScript
- **Cross-browser Compatible** - Tested on Chrome, Firefox, Safari, Edge
- **No Framework Overhead** - Vanilla JS for maximum performance

## 🛠️ Technology Stack

<table>
<tr>
<td align="center" width="25%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="48" height="48" alt="HTML5" />
<br><strong>HTML5</strong>
<br><sub>Semantic Markup</sub>
</td>
<td align="center" width="25%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="48" height="48" alt="CSS3" />
<br><strong>CSS3</strong>
<br><sub>Modern Styling</sub>
</td>
<td align="center" width="25%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width="48" height="48" alt="JavaScript" />
<br><strong>JavaScript ES6+</strong>
<br><sub>Interactive Features</sub>
</td>
<td align="center" width="25%">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg" width="48" height="48" alt="Bootstrap" />
<br><strong>Bootstrap 5.3</strong>
<br><sub>Responsive Grid</sub>
</td>
</tr>
</table>

### Libraries & Tools

- **Font Awesome 6.4** - Comprehensive icon library
- **Google Fonts** - Custom typography (Inter, Poppins)
- **Bootstrap Icons** - Additional iconography
- **GitHub REST API** - Dynamic project integration

## 📂 Project Structure

```
portfolio/
│
├── index.html                  # Main HTML file
│
├── css/
│   ├── style.css              # Core styles with CSS variables
│   ├── dark-mode.css          # Dark theme implementation
│   └── bootstrap-custom.css   # Bootstrap overrides
│
├── js/
│   ├── main.js                # Application initialization
│   ├── smooth-scroll.js       # Enhanced scroll behavior
│   ├── github-api.js          # GitHub repository integration
│   └── dark-mode.js           # Theme toggle functionality
│
├── assets/
│   └── images/
│       ├── profile.jpg        # Profile picture
│       └── projects/          # Project screenshots
│
└── README.md                  # Documentation
```

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (for GitHub API functionality)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/basem3sam/portfolio.git
   cd portfolio
   ```

2. **Run a local server**

   Choose one of the following:

   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js (using npx)
   npx serve .

   # PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

### Quick Setup (No Server)

Simply open `index.html` in your browser for basic functionality. Note: GitHub API features require a local server.

## ⚙️ Configuration

### Personalization

1. **Update GitHub Username**

   ```javascript
   // js/github-api.js
   const username = 'basem3sam'; // Change to your username
   ```

2. **Customize Content**

   - Edit text in `index.html`
   - Replace images in `assets/images/`
   - Update contact information

3. **Modify Theme Colors**
   ```css
   /* css/style.css */
   :root {
     --primary-color: #2c3e50;
     --secondary-color: #3498db;
     --accent-color: #e74c3c;
     /* ... more variables */
   }
   ```

## 🎨 Design System

### Color Palette

#### Light Mode

```css
Primary:    #2c3e50  /* Dark Blue */
Secondary:  #3498db  /* Blue */
Accent:     #e74c3c  /* Red */
Background: #f8f9fa  /* Light Gray */
Text:       #333333  /* Dark Gray */
```

#### Dark Mode

```css
Primary:    #0f172a  /* Deep Blue */
Secondary:  #3b82f6  /* Bright Blue */
Accent:     #ef4444  /* Red */
Background: #1e293b  /* Dark Slate */
Text:       #f1f5f9  /* Light Gray */
```

### Typography

- **Headings:** Poppins (600, 700)
- **Body:** Inter (400, 500, 600)
- **Monospace:** 'Courier New' (code blocks)

### Responsive Breakpoints

| Device       | Breakpoint     |
| ------------ | -------------- |
| Extra Small  | < 375px        |
| Small Mobile | 375px - 575px  |
| Large Mobile | 576px - 767px  |
| Tablet       | 768px - 991px  |
| Laptop       | 992px - 1199px |
| Desktop      | ≥ 1200px       |

## 📦 Sections Overview

### 🏠 Hero Section

- Dynamic greeting with profile image
- Call-to-action buttons
- Social media links
- Animated scroll indicator

### 👤 About Me

- Professional summary
- Core values and approach
- Skill highlights
- Personal interests

### 💻 Technical Skills

- **Backend:** Node.js, Express.js, RESTful APIs
- **Databases:** MongoDB, MySQL, Redis
- **DevOps:** Docker, Git, CI/CD
- **Soft Skills:** Problem-solving, Team collaboration

### 💼 Experience

- Interactive timeline
- Role descriptions
- Key achievements
- Technology used

### 🎯 Projects

- GitHub-integrated showcase
- Live demos and repositories
- Technology stack tags
- Project descriptions

### 🎓 Education

- Academic credentials
- Relevant coursework
- Certifications
- Achievements

### 📧 Contact

- Multiple contact methods
- Social media integration
- Interactive contact cards
- Email and LinkedIn links

## 🔌 JavaScript Modules

### main.js

- Application initialization
- Performance monitoring
- Navbar state management
- Active section detection

### smooth-scroll.js

- Enhanced smooth scrolling
- Back-to-top button
- Scroll progress indicator
- Section navigation

### github-api.js

- Fetches repositories via REST API
- Dynamic project card generation
- Error handling and fallbacks
- Loading states

### dark-mode.js

- Theme toggle functionality
- localStorage persistence
- System preference detection
- Smooth transitions

## 🚢 Deployment

### Netlify (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

Or drag and drop folder to [netlify.com](https://netlify.com)

### GitHub Pages

```bash
# Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# Enable in Settings → Pages → Deploy from main
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🐛 Troubleshooting

| Issue                       | Solution                                                             |
| --------------------------- | -------------------------------------------------------------------- |
| GitHub projects not loading | Check username in `github-api.js`, ensure local server is running    |
| Dark mode not persisting    | Verify localStorage permissions in browser settings                  |
| Smooth scroll not working   | Check JavaScript console for errors, ensure jQuery isn't conflicting |
| Images not displaying       | Verify file paths, check image formats (JPEG, PNG, WebP)             |
| Slow performance            | Enable lazy loading, optimize images, check network tab              |

### Debug Mode

Add `?debug=true` to URL for detailed console logging:

```
http://localhost:8000/?debug=true
```

## 📈 Performance Metrics

- **Lighthouse Score:** 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.0s
- **Total Bundle Size:** < 500KB

## 🤝 Contributing

While this is a personal portfolio, I welcome suggestions and improvements!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -m 'Add improvement'`)
4. Push to branch (`git push origin feature/improvement`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Connect With Me

<div align="center">

[![Email](https://img.shields.io/badge/Email-basem.esam.omar%40gmail.com-red?style=for-the-badge&logo=gmail)](mailto:basem.esam.omar@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Basem%20Esam-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/basem3sam)
[![GitHub](https://img.shields.io/badge/GitHub-basem3sam-black?style=for-the-badge&logo=github)](https://github.com/basem3sam)

</div>

---

<div align="center">

**Built with ❤️ by Basem Esam**

_Last Updated: November 2025_

⭐ Star this repo if you found it helpful!

</div>
