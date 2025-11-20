/**
 * Main JavaScript - Portfolio Initialization & Coordination
 * Orchestrates all site functionality with enhanced performance and reliability
 * @author Basem Esam
 * @version 2.1.0
 */

(function () {
  'use strict';

  // Enhanced configuration with feature flags and performance settings
  const CONFIG = {
    // Navigation & Layout
    navbarScrollThreshold: 100,
    navbarScrolledBg: 'rgba(44, 62, 80, 0.98)',
    navbarScrolledPadding: '0.75rem 0',
    navbarDefaultBg: 'var(--primary-color)',
    headerHeight: 72,

    // Performance
    throttleDelay: 16, // ~60fps
    resizeDelay: 100,
    scrollBuffer: 100,

    // Animations
    animationThreshold: 0.15,
    animationRootMargin: '0px 0px -100px 0px',
    animationStaggerDelay: 100,

    // Feature Flags
    enablePerformanceMonitoring: true,
    enableServiceWorker: false,
    enablePreload: true,
    enableAnalytics: false,

    // Error Handling
    maxRetryAttempts: 2,
    retryDelay: 1000,
  };

  // Comprehensive state management
  const STATE = {
    // Navigation
    isNavbarScrolled: false,
    activeSection: null,
    lastScrollPosition: 0,
    scrollDirection: 'down',

    // Performance
    isInitialized: false,
    loadTime: null,
    observers: new Map(),
    timeouts: new Set(),
    animations: new Set(),

    // Features
    hasIntersectionObserver: 'IntersectionObserver' in window,
    hasResizeObserver: 'ResizeObserver' in window,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches,
  };

  /**
   * Master initialization controller
   */
  function initializePortfolio() {
    // Prevent double initialization
    if (STATE.isInitialized) {
      console.warn('⚠️ Portfolio already initialized');
      return;
    }

    STATE.loadTime = performance.now();

    try {
      // Phase 1: Critical core functionality (blocking)
      initializeCriticalFeatures();

      // Phase 2: Enhanced features (non-blocking)
      requestIdleCallback(() => {
        initializeEnhancedFeatures();
      });

      // Phase 3: Background tasks (deferred)
      setTimeout(() => {
        initializeBackgroundTasks();
      }, 2000);

      STATE.isInitialized = true;
      logInitializationSuccess();
    } catch (error) {
      handleInitializationError(error);
    }
  }

  /**
   * Initialize critical features that affect core user experience
   */
  function initializeCriticalFeatures() {
    // Navigation & Interaction
    initSmoothScroll();
    enhanceButtonGroups();
    // initBackToTop();
    initNavbarScroll();
    initActiveNavLink();

    // Immediate visual enhancements
    if (!STATE.prefersReducedMotion) {
      initCriticalAnimations();
    }

    // Essential external data
    // loadGitHubProjects();
  }

  /**
   * Initialize enhanced features that improve UX but aren't critical
   */
  function initializeEnhancedFeatures() {
    // Advanced animations
    if (STATE.hasIntersectionObserver && !STATE.prefersReducedMotion) {
      initAdvancedAnimations();
    }

    // Performance monitoring
    if (CONFIG.enablePerformanceMonitoring) {
      initPerformanceMonitoring();
    }

    // Interactive enhancements
    initTouchInteractions();
    initKeyboardShortcuts();
    initPreloadStrategies();
  }

  /**
   * Enhance button groups for consistent styling
   */
  /**
   * Enhanced button groups for consistent styling
   */
  function enhanceButtonGroups() {
    const buttonGroups = document.querySelectorAll('.button-group');

    buttonGroups.forEach((group) => {
      const buttons = group.querySelectorAll('.btn');

      // Add data attribute for CSS targeting
      if (buttons.length === 1) {
        group.setAttribute('data-buttons', 'single');
      } else {
        group.setAttribute('data-buttons', 'multiple');

        // Ensure equal height for multiple buttons
        let maxHeight = 0;
        buttons.forEach((btn) => {
          btn.style.height = 'auto'; // Reset height
          maxHeight = Math.max(maxHeight, btn.offsetHeight);
        });

        // Apply consistent height
        buttons.forEach((btn) => {
          btn.style.minHeight = `${maxHeight}px`;
        });
      }

      // Ensure all buttons have proper structure
      buttons.forEach((btn) => {
        if (!btn.querySelector('.btn-content')) {
          const content = btn.innerHTML;
          btn.innerHTML = `<span class="btn-content">${content}</span>`;
        }

        // Add aria-label for better accessibility
        if (!btn.getAttribute('aria-label') && btn.textContent.trim()) {
          btn.setAttribute('aria-label', btn.textContent.trim());
        }
      });
    });

    console.log('🎯 Button groups enhanced');
  }

  /**
   * Initialize background tasks and optimizations
   */
  function initializeBackgroundTasks() {
    // Service Worker for PWA capabilities
    if (CONFIG.enableServiceWorker && 'serviceWorker' in navigator) {
      initServiceWorker();
    }

    // Analytics (if enabled)
    if (CONFIG.enableAnalytics) {
      initAnalytics();
    }

    // Cache warming for future navigation
    initPredictivePreloading();
  }

  /**
   * Initialize back-to-top button functionality
   */
  function initBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');

    if (!backToTopButton) {
      console.warn('⚠️ Back to top button not found');
      return;
    }

    let isVisible = false;
    let showTimeout, hideTimeout;

    // Enhanced scroll handler with debouncing
    const scrollHandler = () => {
      const scrollY = window.pageYOffset;
      const shouldShow = scrollY > 100; // Adjust threshold as needed

      if (shouldShow !== isVisible) {
        // Clear existing timeouts
        clearTimeout(showTimeout);
        clearTimeout(hideTimeout);

        if (shouldShow) {
          // Show with delay
          showTimeout = setTimeout(() => {
            backToTopButton.classList.add('show');
            backToTopButton.setAttribute('aria-hidden', 'false');
            isVisible = true;
          }, 100);
        } else {
          // Hide with delay
          hideTimeout = setTimeout(() => {
            backToTopButton.classList.remove('show');
            backToTopButton.setAttribute('aria-hidden', 'true');
            isVisible = false;
          }, 300);
        }
      }
    };

    // Throttled scroll listener
    window.addEventListener('scroll', scrollHandler, { passive: true });

    // Enhanced click handler
    backToTopButton.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToTop();
    });

    // Keyboard and touch support
    backToTopButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTop();
      }
    });

    console.log('🔼 Back to top button initialized');
  }

  /**
   * Initialize back-to-top button functionality
   */
  function initBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');

    if (!backToTopButton) {
      console.warn('⚠️ Back to top button not found');
      return;
    }

    let isVisible = false;
    let showTimeout, hideTimeout;

    // Enhanced scroll handler with debouncing
    const scrollHandler = () => {
      const scrollY = window.pageYOffset;
      const shouldShow = scrollY > 100;

      if (shouldShow !== isVisible) {
        clearTimeout(showTimeout);
        clearTimeout(hideTimeout);

        if (shouldShow) {
          showTimeout = setTimeout(() => {
            backToTopButton.classList.add('show');
            backToTopButton.setAttribute('aria-hidden', 'false');
            isVisible = true;
          }, 100);
        } else {
          hideTimeout = setTimeout(() => {
            backToTopButton.classList.remove('show');
            backToTopButton.setAttribute('aria-hidden', 'true');
            isVisible = false;
          }, 300);
        }
      }
    };

    // Throttled scroll listener
    window.addEventListener('scroll', scrollHandler, { passive: true });

    // Use smooth-scroll.js API if available, otherwise fallback
    backToTopButton.addEventListener('click', (e) => {
      e.preventDefault();

      if (
        window.smoothScrollAPI &&
        typeof window.smoothScrollAPI.scrollToTop === 'function'
      ) {
        // Use the enhanced scrollToTop from smooth-scroll.js
        window.smoothScrollAPI.scrollToTop();
      } else {
        // Fallback to basic scroll
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    // Keyboard and touch support
    backToTopButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (
          window.smoothScrollAPI &&
          typeof window.smoothScrollAPI.scrollToTop === 'function'
        ) {
          window.smoothScrollAPI.scrollToTop();
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    });

    console.log('🔼 Back to top button initialized');
  }

  /**
   * Initialize smooth scrolling functionality
   * This delegates to the smooth-scroll.js module
   */
  function initSmoothScroll() {
    // Check if smooth scroll is already initialized by smooth-scroll.js
    // smooth-scroll.js auto-initializes, so we just need to verify it worked
    const smoothScrollInitialized =
      document.body.hasAttribute('data-smooth-scroll') ||
      window.smoothScrollAPI;

    if (smoothScrollInitialized) {
      console.log('✅ Smooth scroll already initialized by module');
      return;
    }

    // If not initialized, use our fallback
    console.warn('⚠️ Smooth scroll module not detected, using fallback');
    initBasicSmoothScroll();
  }

  /**
   * Basic smooth scroll fallback
   */
  function initBasicSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');

        if (targetId === '#') {
          e.preventDefault();
          return;
        }

        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
    });

    console.log('✅ Basic smooth scroll initialized');
  }

  /**
   * Enhanced navbar scroll with intersection observer and fallback
   */
  function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Method 1: Intersection Observer (more efficient)
    if (STATE.hasIntersectionObserver) {
      initNavbarScrollObserver(navbar);
    } else {
      // Method 2: Scroll event with throttling (fallback)
      initNavbarScrollEvent(navbar);
    }
  }

  /**
   * Navbar scroll using Intersection Observer
   */
  function initNavbarScrollObserver(navbar) {
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        const isIntersecting = entry.isIntersecting;

        if (!isIntersecting && !STATE.isNavbarScrolled) {
          // Scrolled past header
          setNavbarScrolledState(navbar, true);
        } else if (isIntersecting && STATE.isNavbarScrolled) {
          // Back at top
          setNavbarScrolledState(navbar, false);
        }
      },
      {
        threshold: 0,
        rootMargin: `-${CONFIG.headerHeight}px 0px 0px 0px`,
      }
    );

    // Observe the first section after header
    const firstSection = document.querySelector('section:first-of-type');
    if (firstSection) {
      headerObserver.observe(firstSection);
      STATE.observers.set('navbar', headerObserver);
    }
  }

  /**
   * Navbar scroll using scroll events (fallback)
   */
  function initNavbarScrollEvent(navbar) {
    const scrollHandler = () => {
      const scrollY = window.scrollY;
      const shouldBeScrolled = scrollY > CONFIG.navbarScrollThreshold;

      if (shouldBeScrolled !== STATE.isNavbarScrolled) {
        setNavbarScrolledState(navbar, shouldBeScrolled);
      }

      // Update scroll direction for other features
      STATE.scrollDirection =
        scrollY > STATE.lastScrollPosition ? 'down' : 'up';
      STATE.lastScrollPosition = scrollY;
    };

    window.addEventListener(
      'scroll',
      throttle(scrollHandler, CONFIG.throttleDelay),
      { passive: true }
    );
  }

  /**
   * Set navbar scrolled state with visual updates
   */
  function setNavbarScrolledState(navbar, isScrolled) {
    STATE.isNavbarScrolled = isScrolled;

    if (isScrolled) {
      navbar.style.backgroundColor = CONFIG.navbarScrolledBg;
      navbar.style.padding = CONFIG.navbarScrolledPadding;
      navbar.style.backdropFilter = 'blur(20px) saturate(180%)';
      navbar.classList.add('scrolled');
    } else {
      navbar.style.backgroundColor = CONFIG.navbarDefaultBg;
      navbar.style.padding = '';
      navbar.style.backdropFilter = '';
      navbar.classList.remove('scrolled');
    }
  }

  /**
   * Enhanced active nav link with intersection observer
   */
  function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    // Method 1: Intersection Observer (preferred)
    if (STATE.hasIntersectionObserver) {
      initActiveNavObserver(sections, navLinks);
    } else {
      // Method 2: Scroll event (fallback)
      initActiveNavScroll(sections, navLinks);
    }
  }

  /**
   * Active nav using Intersection Observer
   */
  function initActiveNavObserver(sections, navLinks) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        let mostVisibleSection = null;
        let highestRatio = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > highestRatio) {
            highestRatio = entry.intersectionRatio;
            mostVisibleSection = entry.target;
          }
        });

        if (mostVisibleSection) {
          const sectionId = mostVisibleSection.getAttribute('id');
          setActiveNavLink(sectionId, navLinks);
        }
      },
      {
        threshold: [0.1, 0.5, 0.8],
        rootMargin: `-${CONFIG.scrollBuffer}px 0px -${
          window.innerHeight - CONFIG.scrollBuffer
        }px 0px`,
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
    STATE.observers.set('activeNav', sectionObserver);
  }

  /**
   * Active nav using scroll events (fallback)
   */
  function initActiveNavScroll(sections, navLinks) {
    const scrollHandler = () => {
      const scrollY = window.scrollY + CONFIG.scrollBuffer;
      let activeSection = null;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - CONFIG.headerHeight;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          activeSection = sectionId;
        }
      });

      if (activeSection && activeSection !== STATE.activeSection) {
        setActiveNavLink(activeSection, navLinks);
      }
    };

    window.addEventListener(
      'scroll',
      throttle(scrollHandler, CONFIG.throttleDelay),
      { passive: true }
    );
  }

  /**
   * Set active navigation link
   */
  function setActiveNavLink(sectionId, navLinks) {
    if (STATE.activeSection === sectionId) return;

    STATE.activeSection = sectionId;

    navLinks.forEach((link) => {
      const isActive = link.getAttribute('href') === `#${sectionId}`;
      link.classList.toggle('active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : null);
    });
  }

  /**
   * Critical animations that should run immediately
   */
  function initCriticalAnimations() {
    // Animate hero section elements
    const heroElements = document.querySelectorAll(
      '.hero-section .profile-img, .hero-section h1, .hero-section h2'
    );

    heroElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = `opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${
        index * 0.2
      }s, 
                            transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) ${
                              index * 0.2
                            }s`;

      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 100 + index * 200);
    });
  }

  /**
   * Advanced animations using Intersection Observer
   */
  function initAdvancedAnimations() {
    const observerOptions = {
      threshold: CONFIG.animationThreshold,
      rootMargin: CONFIG.animationRootMargin,
    };

    const animationObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger animations for better UX
          const delay = index * CONFIG.animationStaggerDelay;

          const timeoutId = setTimeout(() => {
            entry.target.classList.add('animate-in');
            animationObserver.unobserve(entry.target);
            STATE.animations.delete(entry.target);
          }, delay);

          STATE.timeouts.add(timeoutId);
          STATE.animations.add(entry.target);
        }
      });
    }, observerOptions);

    // Configure different animation types
    const animationConfigs = {
      '.skill-card': 'fade-up',
      '.project-card': 'fade-up',
      '.timeline-item': 'fade-left',
      '.education-card': 'fade-right',
      '.contact-info': 'fade-in',
    };

    Object.entries(animationConfigs).forEach(([selector, animationClass]) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el, index) => {
        // Set initial state
        el.style.opacity = '0';
        el.style.transform = getInitialTransform(animationClass);
        el.style.transition = `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), 
                              transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)`;
        el.style.transitionDelay = `${index * 0.1}s`;
        el.classList.add(animationClass);

        // Observe for animation
        animationObserver.observe(el);
      });
    });

    STATE.observers.set('animations', animationObserver);
    addAnimationStyles();
  }

  /**
   * Get initial transform based on animation type
   */
  function getInitialTransform(animationClass) {
    const transforms = {
      'fade-up': 'translateY(40px)',
      'fade-down': 'translateY(-40px)',
      'fade-left': 'translateX(40px)',
      'fade-right': 'translateX(-40px)',
      'fade-in': 'scale(0.9)',
      'zoom-in': 'scale(0.8)',
    };
    return transforms[animationClass] || 'translateY(30px)';
  }

  /**
   * Add animation styles dynamically
   */
  function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .animate-in {
        opacity: 1 !important;
        transform: translate(0, 0) scale(1) !important;
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .skill-card,
        .project-card,
        .timeline-item,
        .education-card,
        .contact-info {
          transition: none !important;
          transform: none !important;
          opacity: 1 !important;
        }
        
        .animate-in {
          /* Reset for reduced motion */
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialize touch interactions for mobile devices
   */
  function initTouchInteractions() {
    if (!('ontouchstart' in window)) return;

    const interactiveElements = document.querySelectorAll(
      '.skill-card, .project-card, .btn, .social-links a'
    );

    interactiveElements.forEach((el) => {
      // Add touch feedback
      el.addEventListener(
        'touchstart',
        function () {
          this.classList.add('touch-active');
        },
        { passive: true }
      );

      el.addEventListener(
        'touchend',
        function () {
          this.classList.remove('touch-active');
        },
        { passive: true }
      );

      // Prevent double-tap zoom
      el.addEventListener(
        'touchend',
        function (e) {
          if (e.target.tagName === 'A') {
            e.preventDefault();
          }
        },
        { passive: false }
      );
    });
  }

  /**
   * Initialize keyboard shortcuts and navigation
   */
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Skip if user is typing in an input
      if (e.target.matches('input, textarea, select')) return;

      // Navigation shortcuts
      switch (e.key) {
        case '?':
          // Show keyboard shortcuts help
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            showKeyboardHelp();
          }
          break;

        case 'Escape':
          // Close any open modals or menus
          closeAllModals();
          break;
      }
    });
  }

  /**
   * Initialize performance monitoring
   */
  function initPerformanceMonitoring() {
    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('📊 LCP:', lastEntry.startTime.toFixed(2));
        });
        lcpObserver.observe({
          type: 'largest-contentful-paint',
          buffered: true,
        });

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            console.log(
              '📊 FID:',
              (entry.processingStart - entry.startTime).toFixed(2)
            );
          });
        });
        fidObserver.observe({ type: 'first-input', buffered: true });

        STATE.observers.set('performance', [lcpObserver, fidObserver]);
      } catch (e) {
        console.log('⚠️ Performance monitoring not fully supported');
      }
    }

    // Log load performance
    window.addEventListener('load', () => {
      const navTiming = performance.getEntriesByType('navigation')[0];
      if (navTiming) {
        console.log('📈 Page Load Metrics:', {
          dns: (
            navTiming.domainLookupEnd - navTiming.domainLookupStart
          ).toFixed(2),
          tcp: (navTiming.connectEnd - navTiming.connectStart).toFixed(2),
          ttfb: (navTiming.responseStart - navTiming.requestStart).toFixed(2),
          domContentLoaded: (
            navTiming.domContentLoadedEventEnd - navTiming.navigationStart
          ).toFixed(2),
          fullLoad: (
            navTiming.loadEventEnd - navTiming.navigationStart
          ).toFixed(2),
        });
      }
    });
  }

  /**
   * Initialize preload strategies for critical resources
   */
  function initPreloadStrategies() {
    if (!CONFIG.enablePreload) return;

    // Preload critical images
    const criticalImages = [
      'assets/images/profile.jpg',
      'assets/images/projects/project1.jpeg',
    ];

    criticalImages.forEach((src) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
    });

    // Preconnect to external domains
    const preconnectDomains = [
      'https://api.github.com',
      'https://images.unsplash.com',
    ];

    preconnectDomains.forEach((domain) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      document.head.appendChild(link);
    });
  }

  /**
   * Initialize predictive preloading for likely next pages
   */
  function initPredictivePreloading() {
    // Preload likely next resources based on user behavior
    const likelyPages = ['/projects', '/contact'];

    // Could be enhanced with actual user behavior analysis
    if ('connection' in navigator && navigator.connection.saveData) {
      return; // Don't preload if user has data saver enabled
    }
  }

  /**
   * Enhanced throttle function with cancellation support
   */
  function throttle(func, wait, options = {}) {
    let timeout, context, args, result;
    let previous = 0;

    const later = function () {
      previous = options.leading === false ? 0 : Date.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    const throttled = function () {
      const now = Date.now();
      if (!previous && options.leading === false) previous = now;
      const remaining = wait - (now - previous);
      context = this;
      args = arguments;

      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function () {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  }

  /**
   * Utility function to debounce events
   */
  function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
      const context = this;
      const args = arguments;

      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };

      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) func.apply(context, args);
    };
  }

  /**
   * Log successful initialization with metrics
   */
  function logInitializationSuccess() {
    const loadTime = performance.now() - STATE.loadTime;

    console.log('🎉 Portfolio initialized successfully', {
      loadTime: `${loadTime.toFixed(2)}ms`,
      features: [
        'Enhanced Navigation',
        'Performance Monitoring',
        'Advanced Animations',
        'Touch Optimization',
        'Keyboard Navigation',
      ],
      observers: STATE.observers.size,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle initialization errors gracefully
   */
  function handleInitializationError(error) {
    console.error('💥 Portfolio initialization failed:', error);

    // Ensure basic functionality still works
    ensureCoreFunctionality();

    // Report error if analytics enabled
    if (CONFIG.enableAnalytics) {
      reportError(error);
    }
  }

  /**
   * Ensure core functionality works even if enhanced features fail
   */
  function ensureCoreFunctionality() {
    // Basic smooth scroll
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // Show all content
    document.querySelectorAll('[style*="opacity: 0"]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }

  /**
   * Cleanup function to prevent memory leaks
   */
  function cleanup() {
    // Clear all observers
    STATE.observers.forEach((observer) => {
      if (typeof observer.disconnect === 'function') {
        observer.disconnect();
      } else if (Array.isArray(observer)) {
        observer.forEach((obs) => obs.disconnect());
      }
    });

    // Clear all timeouts
    STATE.timeouts.forEach((timeout) => clearTimeout(timeout));

    // Clear animation tracking
    STATE.animations.clear();

    console.log('🧹 Portfolio cleanup completed');
  }

  // Service Worker initialization
  function initServiceWorker() {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ ServiceWorker registered:', registration.scope);
      })
      .catch((error) => {
        console.log('❌ ServiceWorker registration failed:', error);
      });
  }

  // Analytics initialization (placeholder)
  function initAnalytics() {
    console.log('📊 Analytics initialized');
  }

  // Keyboard help modal
  function showKeyboardHelp() {
    console.log('🆘 Keyboard shortcuts help');
    // Implement modal or console help
  }

  // Close all modals
  function closeAllModals() {
    // Implementation for closing any open modals
  }

  // Error reporting
  function reportError(error) {
    // Implement error reporting service
    console.error('📡 Error reported:', error);
  }

  /**
   * Load GitHub projects - delegates to github-api.js module
   */
  function loadGitHubProjects() {
    // Check if githubAPI is available from github-api.js
    if (
      window.githubAPI &&
      typeof window.githubAPI.loadProjects === 'function'
    ) {
      window.githubAPI.loadProjects();
    } else {
      // Fallback: Show message that GitHub projects couldn't load
      console.warn('⚠️ GitHub API not found, projects will not load');
      showGitHubFallback();
    }
  }

  /**
   * Show fallback message for GitHub projects
   */
  function showGitHubFallback() {
    const container = document.getElementById('github-projects-container');
    const loadingSpinner = document.getElementById('github-loading');
    const fallback = document.getElementById('github-fallback');

    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }

    if (fallback && container) {
      fallback.classList.remove('d-none');
      fallback.innerHTML = `
      <i class="fab fa-github fa-3x mb-3 text-muted" aria-hidden="true"></i>
      <p class="mb-3">GitHub integration not available</p>
      <a href="https://github.com/basem3sam" 
         target="_blank" 
         rel="noopener noreferrer"
         class="btn btn-primary">
        Visit GitHub Profile
      </a>
    `;
    }
  }

  // Public API
  window.portfolioApp = {
    // Core API
    init: initializePortfolio,
    cleanup: cleanup,

    // Configuration
    config: CONFIG,
    state: STATE,

    // Utilities
    utils: {
      throttle: throttle,
      debounce: debounce,
    },

    // Feature controls
    features: {
      refreshGitHub: () => window.githubAPI?.refreshProjects?.(),
      reloadAnimations: initAdvancedAnimations,
    },
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePortfolio);
  } else {
    // DOM already loaded, initialize on next tick
    setTimeout(initializePortfolio, 0);
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  // Handle page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, reduce activity
      STATE.observers.forEach((observer) => {
        if (typeof observer.unobserveAll === 'function') {
          observer.unobserveAll();
        }
      });
    } else {
      // Page is visible, restore activity
      STATE.observers.forEach((observer) => {
        if (typeof observer.observeAll === 'function') {
          observer.observeAll();
        }
      });
    }
  });
})();
