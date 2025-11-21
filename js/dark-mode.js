// dark-mode.js - Dark Mode Toggle Functionality
(function () {
  'use strict';

  const darkModeToggle = document.getElementById('darkModeToggle');
  const icon = darkModeToggle.querySelector('i');

  // Function to update favicon based on theme
  function updateFavicon(theme) {
    const favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) return;

    if (theme === 'dark') {
      // Use your dark mode favicon
      favicon.href = './assets/icons/dark/favicon.ico';
      // Also update other favicon sizes if needed
      document.querySelector("link[sizes='32x32']").href =
        './assets/icons/dark/favicon-32x32.png';
      document.querySelector("link[sizes='16x16']").href =
        './assets/icons/dark/favicon-16x16.png';
    } else {
      // Use your light mode favicon
      favicon.href = './assets/icons/light/favicon.ico';
      document.querySelector("link[sizes='32x32']").href =
        './assets/icons/light/favicon-32x32.png';
      document.querySelector("link[sizes='16x16']").href =
        './assets/icons/light/favicon-16x16.png';
    }
  }

  // Check for user preference
  function getPreferredTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  // Apply theme
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      icon.classList.replace('fa-moon', 'fa-sun');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      icon.classList.replace('fa-sun', 'fa-moon');
      localStorage.setItem('theme', 'light');
    }

    // Update favicon when theme changes
    updateFavicon(theme);
  }

  // Initialize
  function initDarkMode() {
    const preferredTheme = getPreferredTheme();
    applyTheme(preferredTheme);

    // Toggle on click
    darkModeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark-mode');
      applyTheme(isDark ? 'light' : 'dark');
    });

    // Listen for system theme changes
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });

    console.log('🌓 Dark mode initialized');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDarkMode);
  } else {
    initDarkMode();
  }
})();
