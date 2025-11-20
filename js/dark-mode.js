// dark-mode.js - Dark Mode Toggle Functionality
(function () {
  'use strict';

  const darkModeToggle = document.getElementById('darkModeToggle');
  const icon = darkModeToggle.querySelector('i');

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
