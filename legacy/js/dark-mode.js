/**
 * Unified Dark Mode System
 * Works for both index.html and links.html
 */
(function () {
  'use strict';

  const CONFIG = {
    storageKey: 'theme',
    darkClass: 'dark-mode',
    faviconPaths: {
      dark: {
        png32: './assets/icons/dark/favicon-32x32.png',
        png16: './assets/icons/dark/favicon-16x16.png',
        appleTouchIcon: './assets/icons/dark/apple-touch-icon.png',
      },
      light: {
        png32: './assets/icons/light/favicon-32x32.png',
        png16: './assets/icons/light/favicon-16x16.png',
        appleTouchIcon: './assets/icons/light/apple-touch-icon.png',
      },
    },
  };

  function getPreferredTheme() {
    const saved = localStorage.getItem(CONFIG.storageKey);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function updateFavicons(theme) {
    const paths = CONFIG.faviconPaths[theme];
    const favicon32 = document.querySelector("link[sizes='32x32']");
    const favicon16 = document.querySelector("link[sizes='16x16']");
    const appleIcon = document.querySelector("link[rel='apple-touch-icon']");

    if (favicon32) favicon32.href = paths.png32;
    if (favicon16) favicon16.href = paths.png16;
    if (appleIcon) appleIcon.href = paths.appleTouchIcon;
  }

  function updateToggleButton(theme) {
    // For index.html (navbar)
    const navToggle = document.getElementById('darkModeToggle');
    if (navToggle) {
      const icon = navToggle.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
      navToggle.setAttribute(
        'aria-label',
        `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
      );
    }

    // For links.html (floating button)
    const linksToggle = document.getElementById('themeToggle');
    if (linksToggle) {
      const icon = linksToggle.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
      linksToggle.setAttribute(
        'aria-label',
        `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`
      );
    }
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add(CONFIG.darkClass);
    } else {
      document.body.classList.remove(CONFIG.darkClass);
    }

    updateToggleButton(theme);
    updateFavicons(theme);
    localStorage.setItem(CONFIG.storageKey, theme);

    document.dispatchEvent(
      new CustomEvent('themeChange', { detail: { theme } })
    );
  }

  function toggleTheme() {
    const current = document.body.classList.contains(CONFIG.darkClass)
      ? 'dark'
      : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  }

  function init() {
    const theme = getPreferredTheme();
    applyTheme(theme);

    // Initialize all toggle buttons
    document
      .querySelectorAll('#darkModeToggle, #themeToggle')
      .forEach((btn) => {
        if (btn) {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            toggleTheme();
          });

          btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleTheme();
            }
          });
        }
      });

    // System theme listener
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        if (!localStorage.getItem(CONFIG.storageKey)) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      });

    // Keyboard shortcut: Ctrl/Cmd + Shift + D
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggleTheme();
      }
    });

    console.log('🌓 Dark mode initialized');
  }

  // Prevent flash - apply immediately
  if (document.readyState === 'loading') {
    const theme = getPreferredTheme();
    if (theme === 'dark') {
      document.documentElement.classList.add(CONFIG.darkClass);
    }
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
  window.darkModeAPI = {
    toggle: toggleTheme,
    setTheme: applyTheme,
    getTheme: () =>
      document.body.classList.contains(CONFIG.darkClass) ? 'dark' : 'light',
  };
})();
