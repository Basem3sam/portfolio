/**
 * Smooth Scroll & Navigation Enhancement
 * Handles smooth scrolling and back-to-top functionality with enhanced features
 * @author Basem Esam
 * @version 2.1.0
 */

(function () {
  'use strict';

  // Enhanced configuration
  const SCROLL_CONFIG = {
    // Navigation
    offset: 70, // Account for fixed navbar
    behavior: 'smooth',

    // Back to top
    backToTopThreshold: 300,
    backToTopShowDelay: 100,
    backToTopHideDelay: 300,

    // Animation
    scrollDuration: 800,
    easingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',

    // Performance
    scrollThrottleDelay: 16, // ~60fps
    resizeThrottleDelay: 100,

    // Mobile
    mobileBreakpoint: 768,
    touchScrollDuration: 600,
  };

  // State management
  const SCROLL_STATE = {
    isScrolling: false,
    scrollTimeout: null,
    lastScrollPosition: 0,
    scrollDirection: 'down',
    activeTarget: null,
    observers: new Set(),
  };

  /**
   * Initialize all smooth scroll functionality
   */
  function initSmoothScroll() {
    try {
      initAnchorScroll();
      initBackToTop();
      initScrollIndicators();
      initScrollProgress();
      initKeyboardNavigation();

      console.log('🎯 Smooth scroll system initialized', {
        features: [
          'Anchor Navigation',
          'Back to Top',
          'Scroll Progress',
          'Keyboard Nav',
        ],
        nativeSupport: 'scrollBehavior' in document.documentElement.style,
      });

      // ADD THIS LINE to track initialization
      document.body.setAttribute('data-smooth-scroll', 'initialized');
    } catch (error) {
      console.error('❌ Smooth scroll initialization failed:', error);
      initFallbackNavigation();
    }
  }

  /**
   * Initialize smooth scrolling for anchor links with enhanced features
   */
  function initAnchorScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach((anchor) => {
      // Add accessibility attributes
      anchor.setAttribute('role', 'link');
      anchor.setAttribute('tabindex', '0');

      // Enhanced click handling
      anchor.addEventListener('click', handleEnhancedScroll);

      // Keyboard navigation
      anchor.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleEnhancedScroll.call(anchor, e);
        }
      });

      // Touch device optimization
      anchor.addEventListener('touchend', (e) => {
        if (!e.target.closest('button, .btn')) {
          handleEnhancedScroll.call(anchor, e);
        }
      });
    });

    // Observe section visibility for active states
    initSectionObserver();
  }

  /**
   * Enhanced scroll handler with progress tracking
   * @param {Event} e - Click event
   */
  function handleEnhancedScroll(e) {
    const targetId = this.getAttribute('href');

    if (targetId === '#' || targetId === '#0') {
      e.preventDefault();
      return;
    }

    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      e.preventDefault();

      // Prevent multiple simultaneous scrolls
      if (SCROLL_STATE.isScrolling) {
        return;
      }

      SCROLL_STATE.isScrolling = true;
      SCROLL_STATE.activeTarget = targetId;

      // Close mobile menu
      closeMobileMenu();

      // Add loading state to clicked link
      this.classList.add('scrolling');

      // Perform scroll with enhanced options
      enhancedSmoothScroll(targetElement, {
        onStart: () => {
          // Emit custom event
          document.dispatchEvent(
            new CustomEvent('scrollStart', {
              detail: { target: targetElement, trigger: this },
            })
          );
        },
        onComplete: () => {
          this.classList.remove('scrolling');
          SCROLL_STATE.isScrolling = false;
          SCROLL_STATE.activeTarget = null;

          // Update URL and focus
          updateUrlAndFocus(targetId, targetElement);

          // Emit custom event
          document.dispatchEvent(
            new CustomEvent('scrollComplete', {
              detail: { target: targetElement, trigger: this },
            })
          );
        },
        onCancel: () => {
          this.classList.remove('scrolling');
          SCROLL_STATE.isScrolling = false;
          SCROLL_STATE.activeTarget = null;
        },
      });
    }
  }

  /**
   * Enhanced smooth scroll with callbacks and error handling
   * @param {HTMLElement} element - Target element
   * @param {Object} callbacks - Lifecycle callbacks
   */
  function enhancedSmoothScroll(element, callbacks = {}) {
    const { onStart, onComplete, onCancel } = callbacks;

    const targetPosition = calculateScrollPosition(element);
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;

    // Don't scroll if already at target (within 2px tolerance)
    if (Math.abs(distance) < 2) {
      if (onComplete) onComplete();
      return;
    }

    // Call start callback
    if (onStart) onStart();

    // Cancel any existing scroll
    cancelScroll();

    // Use native smooth scroll if available and not reduced motion
    if (supportsNativeSmoothScroll() && !prefersReducedMotion()) {
      performNativeScroll(targetPosition, onComplete, onCancel);
    } else {
      performAnimatedScroll(startPosition, distance, onComplete, onCancel);
    }
  }

  /**
   * Calculate scroll position with dynamic offset
   * @param {HTMLElement} element - Target element
   * @returns {number} Calculated scroll position
   */
  function calculateScrollPosition(element) {
    const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
    const dynamicOffset = calculateDynamicOffset();

    return Math.max(0, elementTop - dynamicOffset);
  }

  /**
   * Calculate dynamic offset based on viewport and navbar state
   * @returns {number} Dynamic offset value
   */
  function calculateDynamicOffset() {
    const navbar = document.querySelector('.navbar');
    let offset = SCROLL_CONFIG.offset;

    if (navbar) {
      const navbarHeight = navbar.offsetHeight;
      const isNavbarScrolled = navbar.classList.contains('scrolled');

      // Adjust offset based on navbar state
      offset = isNavbarScrolled ? navbarHeight - 10 : navbarHeight + 10;
    }

    // Reduce offset on mobile
    if (window.innerWidth < SCROLL_CONFIG.mobileBreakpoint) {
      offset *= 0.8;
    }

    return Math.max(50, offset); // Minimum 50px offset
  }

  /**
   * Perform native smooth scroll
   * @param {number} targetPosition - Target scroll position
   * @param {Function} onComplete - Completion callback
   * @param {Function} onCancel - Cancellation callback
   */
  function performNativeScroll(targetPosition, onComplete, onCancel) {
    const scrollOptions = {
      top: targetPosition,
      behavior: SCROLL_CONFIG.behavior,
    };

    // Add timeout for completion detection
    const scrollTimeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, SCROLL_CONFIG.scrollDuration);

    // Listen for scroll end
    const scrollEndHandler = () => {
      if (Math.abs(window.pageYOffset - targetPosition) < 5) {
        clearTimeout(scrollTimeout);
        window.removeEventListener('scroll', scrollEndHandler);
        SCROLL_STATE.observers.delete(scrollEndHandler);
        if (onComplete) onComplete();
      }
    };

    window.addEventListener('scroll', scrollEndHandler);
    SCROLL_STATE.observers.add(scrollEndHandler);

    // Set cancellation timeout
    SCROLL_STATE.scrollTimeout = setTimeout(() => {
      window.removeEventListener('scroll', scrollEndHandler);
      SCROLL_STATE.observers.delete(scrollEndHandler);
      if (onCancel) onCancel();
    }, SCROLL_CONFIG.scrollDuration + 500);

    // Perform scroll
    window.scrollTo(scrollOptions);
  }

  /**
   * Perform custom animated scroll
   * @param {number} startPosition - Start position
   * @param {number} distance - Scroll distance
   * @param {Function} onComplete - Completion callback
   * @param {Function} onCancel - Cancellation callback
   */
  function performAnimatedScroll(
    startPosition,
    distance,
    onComplete,
    onCancel
  ) {
    let startTime = null;
    let animationFrameId = null;

    const animateScroll = (currentTime) => {
      if (!startTime) startTime = currentTime;

      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / SCROLL_CONFIG.scrollDuration, 1);
      const easeProgress = customEasingFunction(progress);

      const currentPosition = startPosition + distance * easeProgress;
      window.scrollTo(0, currentPosition);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateScroll);
      } else {
        // Animation complete
        cancelAnimationFrame(animationFrameId);
        if (onComplete) onComplete();
      }
    };

    // Start animation
    animationFrameId = requestAnimationFrame(animateScroll);

    // Store for potential cancellation
    SCROLL_STATE.scrollTimeout = animationFrameId;
  }

  /**
   * Custom easing function with multiple options
   * @param {number} t - Progress (0-1)
   * @returns {number} Eased progress
   */
  function customEasingFunction(t) {
    // cubic-bezier(0.4, 0, 0.2, 1) - Material Design standard
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * Cancel any ongoing scroll operation
   */
  function cancelScroll() {
    if (SCROLL_STATE.scrollTimeout) {
      if (typeof SCROLL_STATE.scrollTimeout === 'number') {
        cancelAnimationFrame(SCROLL_STATE.scrollTimeout);
      } else {
        clearTimeout(SCROLL_STATE.scrollTimeout);
      }
      SCROLL_STATE.scrollTimeout = null;
    }

    // Clean up observers
    SCROLL_STATE.observers.forEach((observer) => {
      window.removeEventListener('scroll', observer);
    });
    SCROLL_STATE.observers.clear();

    SCROLL_STATE.isScrolling = false;
  }

  /**
   * Enhanced back-to-top functionality
   */
  /**
   * Enhanced back-to-top functionality - ACCESSIBLE VERSION
   */
  function initBackToTop() {
    const backToTopButton = document.querySelector('.back-to-top');

    if (!backToTopButton) {
      console.warn('⚠️ Back to top button not found');
      return;
    }

    let isVisible = false;
    let scrollTimeout;
    let isScrollingToTop = false;

    backToTopButton.removeAttribute('aria-hidden');

    const scrollHandler = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      scrollTimeout = setTimeout(() => {
        const scrollY = window.pageYOffset;
        const shouldShow = scrollY > SCROLL_CONFIG.backToTopThreshold;

        if (isScrollingToTop) {
          return;
        }

        if (shouldShow !== isVisible) {
          if (shouldShow && !isVisible) {
            backToTopButton.classList.add('show');
            isVisible = true;
          } else if (!shouldShow && isVisible) {
            backToTopButton.classList.remove('show');
            isVisible = false;

            if (document.activeElement === backToTopButton) {
              backToTopButton.blur();
            }
          }
        }
      }, 10);
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    // ✅ MOBILE TOUCH FIX - Main handler function
    const handleScrollToTop = (e) => {
      e.preventDefault();
      e.stopPropagation();

      isScrollingToTop = true;
      backToTopButton.classList.remove('show');
      isVisible = false;
      backToTopButton.blur();

      scrollToTop();

      setTimeout(() => {
        isScrollingToTop = false;
        const scrollY = window.pageYOffset;
        if (scrollY > SCROLL_CONFIG.backToTopThreshold) {
          backToTopButton.classList.add('show');
          isVisible = true;
        }
      }, 1000);
    };

    // ✅ DESKTOP: Click event
    backToTopButton.addEventListener('click', handleScrollToTop);

    // ✅ MOBILE: Touch events (PRIMARY FIX)
    backToTopButton.addEventListener(
      'touchstart',
      (e) => {
        backToTopButton.style.transform = 'scale(0.95)';
      },
      { passive: true }
    );

    backToTopButton.addEventListener('touchend', (e) => {
      backToTopButton.style.transform = '';
      handleScrollToTop(e);
    });

    backToTopButton.addEventListener('touchcancel', (e) => {
      backToTopButton.style.transform = '';
    });

    // ✅ MODERN: Pointer events
    if ('PointerEvent' in window) {
      backToTopButton.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch') {
          backToTopButton.style.transform = 'scale(0.95)';
        }
      });

      backToTopButton.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'touch') {
          backToTopButton.style.transform = '';
        }
      });
    }

    // Keyboard support
    backToTopButton.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleScrollToTop(e);
      }
    });

    backToTopButton.addEventListener('focus', () => {
      if (!backToTopButton.classList.contains('show')) {
        backToTopButton.blur();
      }
    });

    scrollHandler();

    console.log('🔼 Back to top button initialized with mobile touch support');
  }

  /**
   * Scroll to top with enhanced behavior
   */
  /**
   * Scroll to top with enhanced behavior
   */
  function scrollToTop() {
    console.log('🚀 Starting scroll to top');

    // Hide button immediately when clicked
    const backToTopButton = document.querySelector('.back-to-top');
    if (backToTopButton) {
      backToTopButton.classList.remove('show');
      backToTopButton.setAttribute('aria-hidden', 'true');
    }

    // Use native smooth scroll if available
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      // Set timeout to check if we need to show button again
      setTimeout(() => {
        const scrollY = window.pageYOffset;
        if (scrollY > SCROLL_CONFIG.backToTopThreshold) {
          backToTopButton.classList.add('show');
          backToTopButton.setAttribute('aria-hidden', 'false');
        }
      }, 1000);
    } else {
      // Fallback animation
      const startPosition = window.pageYOffset;
      const distance = -startPosition;
      let startTime = null;

      function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / 800, 1);
        const easeProgress =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, startPosition + distance * easeProgress);

        if (progress < 1) {
          requestAnimationFrame(animation);
        } else {
          // Animation complete - ensure button is hidden
          setTimeout(() => {
            if (
              backToTopButton &&
              window.pageYOffset <= SCROLL_CONFIG.backToTopThreshold
            ) {
              backToTopButton.classList.remove('show');
              backToTopButton.setAttribute('aria-hidden', 'true');
            }
          }, 100);
        }
      }
      requestAnimationFrame(animation);
    }

    // Remove focus from back-to-top button after click
    setTimeout(() => {
      if (backToTopButton) {
        backToTopButton.blur(); // Remove focus
      }
    }, 500);
  }

  /**
   * Enhanced throttle function for smooth-scroll.js
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
   * Initialize scroll progress indicator
   */
  function initScrollProgress() {
    // Create progress bar if not exists
    let progressBar = document.querySelector('.scroll-progress');

    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'scroll-progress';
      progressBar.setAttribute('role', 'progressbar');
      progressBar.setAttribute('aria-label', 'Scroll progress');
      progressBar.setAttribute('aria-valuemin', '0');
      progressBar.setAttribute('aria-valuemax', '100');

      const style = document.createElement('style');
      style.textContent = `
        .scroll-progress {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, var(--secondary-color), var(--gradient-start));
          transform-origin: left;
          transform: scaleX(0);
          transition: transform 0.1s ease;
          z-index: var(--z-tooltip);
          pointer-events: none;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .scroll-progress {
            display: none;
          }
        }
      `;
      document.head.appendChild(style);
      document.body.appendChild(progressBar);
    }

    // Update progress on scroll
    window.addEventListener(
      'scroll',
      () => {
        const winHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset;
        const scrollPercent = scrollTop / (docHeight - winHeight);
        const progress = Math.min(Math.max(scrollPercent, 0), 1);

        progressBar.style.transform = `scaleX(${progress})`;
        progressBar.setAttribute('aria-valuenow', Math.round(progress * 100));
      },
      { passive: true }
    );
  }

  /**
   * Initialize keyboard navigation enhancements
   */
  function initKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Page up/down for main content navigation
      if (e.key === 'PageDown' || e.key === 'PageUp') {
        e.preventDefault();
        const direction = e.key === 'PageDown' ? 1 : -1;
        const scrollAmount = window.innerHeight * 0.8;
        window.scrollBy({ top: scrollAmount * direction, behavior: 'smooth' });
      }

      // Home/End keys
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        const target =
          e.key === 'Home' ? 0 : document.documentElement.scrollHeight;
        window.scrollTo({ top: target, behavior: 'smooth' });
      }
    });
  }

  /**
   * Utility functions
   */
  function supportsNativeSmoothScroll() {
    return 'scrollBehavior' in document.documentElement.style;
  }

  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function closeMobileMenu() {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarCollapse?.classList.contains('show') && navbarToggler) {
      navbarToggler.click();
    }
  }

  function updateUrlAndFocus(targetId, targetElement) {
    // Update URL
    if (history.pushState) {
      history.pushState(null, null, targetId);
    }

    // Set focus for accessibility
    setTimeout(() => {
      targetElement.setAttribute('tabindex', '-1');
      targetElement.focus({ preventScroll: true });
    }, 100);
  }

  /**
   * Fallback navigation for when JS fails
   */
  function initFallbackNavigation() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView();
        }
      });
    });
  }

  /**
   * Initialize section observer for scroll animations (placeholder)
   * This would be used for more advanced scroll-based animations
   */
  function initSectionObserver() {
    // This is a placeholder function that would be implemented
    // for more advanced scroll-triggered animations
    // For now, we'll just log that it's available
    console.log('🎯 Section observer available (placeholder)');

    // If you want to implement actual section observation:
    /*
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('section').forEach(section => {
      sectionObserver.observe(section);
    });
  }
  */
  }

  /**
   * Initialize scroll indicators (placeholder)
   */
  function initScrollIndicators() {
    // This would be for scroll direction indicators
    console.log('📏 Scroll indicators available (placeholder)');
  }

  /**
   * Initialize scroll progress (already implemented)
   * This is just to confirm it exists
   */
  function initScrollProgress() {
    // This function is already implemented in your code
    // This declaration ensures it's available
    console.log('📊 Scroll progress available');
  }

  // Initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothScroll);
  } else {
    initSmoothScroll();
  }

  // Export API
  window.smoothScrollAPI = {
    scrollTo: enhancedSmoothScroll,
    scrollToTop,
    cancelScroll,
    calculateScrollPosition,
    CONFIG: SCROLL_CONFIG,
    STATE: SCROLL_STATE,
  };
})();
