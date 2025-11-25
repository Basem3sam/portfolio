window.openTerminal = function () {
  // Close any Konami master notification when opening terminal
  const masterNotification = document.querySelector(
    '.konami-master-notification'
  );
  if (masterNotification) {
    masterNotification.classList.remove('show');
    setTimeout(() => {
      if (masterNotification.parentNode) {
        masterNotification.remove();
      }
    }, 300);
  }

  const terminal = document.getElementById('secret-terminal');
  const backdrop = document.getElementById('terminal-backdrop');
  if (terminal && backdrop) {
    terminal.classList.add('active');
    backdrop.classList.add('active');

    // Display welcome message
    const output = document.getElementById('terminal-output');
    if (output) {
      output.innerHTML = '';

      const ASCII_LOGO = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        ██████╗  █████╗ ███████╗███████╗███╗   ███╗        ║
║        ██╔══██╗██╔══██╗██╔════╝██╔════╝████╗ ████║        ║
║        ██████╔╝███████║███████╗█████╗  ██╔████╔██║        ║
║        ██╔══██╗██╔══██║╚════██║██╔══╝  ██║╚██╔╝██║        ║
║        ██████╔╝██║  ██║███████║███████╗██║ ╚═╝ ██║        ║
║        ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝        ║
║                                                           ║
║                 SECRET DEVELOPER TERMINAL                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `;

      const line1 = document.createElement('div');
      line1.className = 'terminal-line ascii-art';
      line1.innerHTML = ASCII_LOGO;
      output.appendChild(line1);

      const line2 = document.createElement('div');
      line2.className = 'terminal-line terminal-success';
      line2.textContent = "Welcome to Basem's Secret Developer Terminal!";
      output.appendChild(line2);

      const line3 = document.createElement('div');
      line3.className = 'terminal-line terminal-info';
      line3.textContent = 'Type "help" to see available commands.';
      output.appendChild(line3);

      const line4 = document.createElement('div');
      line4.className = 'terminal-line';
      output.appendChild(line4);
    }

    // Auto-scroll to bottom
    const terminalBody = document.querySelector('.terminal-body');
    if (terminalBody) {
      terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // Focus input (if not on mobile)
    const input = document.getElementById('terminal-input');
    if (input && window.innerWidth > 768) {
      input.focus();
    }
  }
};

window.closeTerminal = function () {
  const terminal = document.getElementById('secret-terminal');
  const backdrop = document.getElementById('terminal-backdrop');

  if (terminal) terminal.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
};

function showMobileSecretPrompt() {
  const overlay = document.createElement('div');
  overlay.className = 'mobile-secret-overlay';
  overlay.innerHTML = `
    <div class="mobile-secret-container">
      <div class="mobile-secret-header">
        <h3>🔒 Secret Terminal Access</h3>
        <button class="mobile-secret-close">&times;</button>
      </div>
      
      <div class="mobile-secret-content">
        <div class="secret-icon">🎮</div>
        <p class="secret-message">
          Enter the legendary Konami Code to unlock the developer terminal
        </p>
        <p class="secret-hint">
          <em>A classic gaming sequence holds the key...</em>
        </p>
        
        <div class="secret-progress">
          <div class="progress-hint">
            <span class="hint-text">The code is hidden in gaming history</span>
          </div>
        </div>
        
        <div class="mobile-secret-buttons">
          <button class="secret-btn try-sequence" id="try-sequence">
            <i class="fas fa-keyboard"></i>
            Enter Konami Code
          </button>
          <button class="secret-btn exit-secret" id="exit-secret">
            <i class="fas fa-times"></i>
            Cancel
          </button>
        </div>
        
        <div class="secret-footer">
          <small>💡 Hint: Click profile image repeatedly for clues</small>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Enter Code button - goes to special keyboard input
  overlay.querySelector('#try-sequence').addEventListener('click', (e) => {
    e.stopPropagation();
    overlay.remove();
    showSpecialKeyboardInput();
  });

  // Cancel button
  overlay.querySelector('#exit-secret').addEventListener('click', (e) => {
    e.stopPropagation();
    overlay.remove();
  });

  // Close X button
  overlay
    .querySelector('.mobile-secret-close')
    .addEventListener('click', (e) => {
      e.stopPropagation();
      overlay.remove();
    });

  // Prevent clicks inside container from closing
  overlay
    .querySelector('.mobile-secret-container')
    .addEventListener('click', (e) => {
      e.stopPropagation();
    });

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

function showSpecialKeyboardInput() {
  const overlay = document.createElement('div');
  overlay.className = 'mobile-special-overlay';
  overlay.innerHTML = `
    <div class="mobile-special-container">
      <div class="mobile-special-header">
        <h3>⚡ Enter Konami Code</h3>
        <button class="mobile-special-close">&times;</button>
      </div>
      
      <div class="mobile-special-content">
        <p class="special-message">
          Tap the buttons in the correct sequence
        </p>
        
        <div class="sequence-tracker">
          <div class="tracker-display" id="tracker-display">
            <span class="tracker-placeholder">Tap to begin...</span>
          </div>
          <div class="tracker-actions">
            <button id="clear-tracker">Clear</button>
          </div>
        </div>
        
        <div class="special-input-buttons">
          <button class="special-btn direction-btn" data-key="ArrowUp">↑</button>
          <button class="special-btn direction-btn" data-key="ArrowDown">↓</button>
          <button class="special-btn direction-btn" data-key="ArrowLeft">←</button>
          <button class="special-btn direction-btn" data-key="ArrowRight">→</button>
          <button class="special-btn letter-btn" data-key="b">B</button>
          <button class="special-btn letter-btn" data-key="a">A</button>
        </div>
        
        <div class="special-hint">
          <small>💡 A legendary gaming sequence from the 80s</small>
        </div>
        
        <div class="special-back">
          <button class="special-btn back-btn" id="back-to-start">
            <i class="fas fa-arrow-left"></i> Back
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];
  let enteredSequence = [];

  function updateTracker() {
    const tracker = overlay.querySelector('#tracker-display');

    if (enteredSequence.length === 0) {
      tracker.innerHTML =
        '<span class="tracker-placeholder">Tap to begin...</span>';
    } else {
      const display = {
        ArrowUp: '↑',
        ArrowDown: '↓',
        ArrowLeft: '←',
        ArrowRight: '→',
        b: 'B',
        a: 'A',
      };
      tracker.innerHTML = enteredSequence
        .map((key) => `<span class="tracked-key">${display[key]}</span>`)
        .join(' ');
    }
  }

  function checkSpecialSequence() {
    if (enteredSequence.length === konamiCode.length) {
      const isCorrect = enteredSequence.every(
        (key, index) => key === konamiCode[index]
      );

      if (isCorrect) {
        // SUCCESS - Open terminal!
        overlay.remove();
        window.openTerminal();
        showAccessGranted();
        createCelebrationParticles();
        createConfettiBurst();
        playSuccessSound();

        // Store that user has unlocked it
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('konamiUnlocked', 'true');
        }
      } else {
        // WRONG - Shake and reset
        const tracker = overlay.querySelector('#tracker-display');
        tracker.classList.add('wrong-sequence');

        // Show error feedback
        const feedback = document.createElement('div');
        feedback.className = 'sequence-feedback error';
        feedback.textContent = '❌ Incorrect sequence!';
        overlay.querySelector('.sequence-tracker').appendChild(feedback);

        setTimeout(() => {
          tracker.classList.remove('wrong-sequence');
          if (feedback.parentNode) {
            feedback.remove();
          }
        }, 1000);

        setTimeout(() => {
          enteredSequence = [];
          updateTracker();
        }, 1500);
      }
    }
  }

  // Button handlers for arrow keys and letters
  overlay.querySelectorAll('.direction-btn, .letter-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const key = btn.getAttribute('data-key');
      enteredSequence.push(key);

      // Visual feedback
      btn.style.transform = 'scale(0.9)';
      setTimeout(() => {
        btn.style.transform = 'scale(1)';
      }, 100);

      updateTracker();

      // Auto-check when sequence is complete
      if (enteredSequence.length === konamiCode.length) {
        setTimeout(() => checkSpecialSequence(), 500);
      }
    });
  });

  // Clear button
  overlay.querySelector('#clear-tracker').addEventListener('click', (e) => {
    e.stopPropagation();
    enteredSequence = [];
    updateTracker();
  });

  // Back button
  overlay.querySelector('#back-to-start').addEventListener('click', (e) => {
    e.stopPropagation();
    overlay.remove();
    showMobileSecretPrompt();
  });

  // Close X button
  overlay
    .querySelector('.mobile-special-close')
    .addEventListener('click', (e) => {
      e.stopPropagation();
      overlay.remove();
    });

  // Prevent clicks inside container from closing
  overlay
    .querySelector('.mobile-special-container')
    .addEventListener('click', (e) => {
      e.stopPropagation();
    });

  // Click outside to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

function showAccessGranted() {
  const notification = document.createElement('div');
  notification.className = 'access-granted-notification';
  notification.innerHTML = `
    <i class="fas fa-unlock-alt"></i>
    <span>Access Granted! The terminal awaits... 🎉</span>
  `;
  document.body.appendChild(notification);

  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 500);
  }, 3000);
}

// Helper function to create celebration particles
function createCelebrationParticles() {
  const particles = ['🎉', '✨', '⭐', '🎊', '💫', '🌟', '🎆'];
  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    setTimeout(() => {
      const particle = document.createElement('div');
      particle.className = 'celebration-particle';
      particle.textContent =
        particles[Math.floor(Math.random() * particles.length)];

      // Random starting position near center
      const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
      const startY = window.innerHeight / 2 + (Math.random() - 0.5) * 200;

      particle.style.left = startX + 'px';
      particle.style.top = startY + 'px';

      // Random direction
      particle.style.setProperty('--particle-x', (Math.random() - 0.5) * 300);
      particle.style.setProperty('--particle-y', -Math.random() * 200 - 100);

      document.body.appendChild(particle);

      // Remove after animation
      setTimeout(() => particle.remove(), 2000);
    }, i * 50);
  }
}

// Helper function to create confetti burst
function createConfettiBurst() {
  const colors = [
    '#ff6b6b',
    '#ee5a24',
    '#feca57',
    '#48dbfb',
    '#ff9ff3',
    '#4ecdc4',
  ];
  const confettiCount = 50;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';

      const color = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.setProperty('--confetti-color', color);
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.animationDuration = Math.random() * 2 + 2 + 's';

      document.body.appendChild(confetti);

      // Remove after animation
      setTimeout(() => confetti.remove(), 5000);
    }, i * 30);
  }
}

function playSuccessSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // Success melody
    oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5

    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioCtx.currentTime + 0.5
    );

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    // Silent fallback if audio context fails
    console.log('🔊 Success sound played (silent fallback)');
  }
}

function showEnhancedMasterNotification() {
  const notification = document.createElement('div');
  notification.className = 'konami-master-notification';
  notification.innerHTML = `
    <div class="konami-badge">
      <i class="fas fa-trophy"></i>
      <span>KONAMI CODE MASTER!</span>
      <i class="fas fa-trophy"></i>
    </div>
    
    <p>
      🎮 You've unlocked the <strong>legendary 10-click sequence</strong>!<br>
      <span style="font-size: 12px;">The secret terminal awaits your command...</span>
    </p>
    
    <div class="konami-sequence">
      <code>↑ ↑ ↓ ↓ ← → ← → B A</code>
    </div>
    
    <div class="backup-method">
      <small>⚡ Quick Access Shortcut:</small>
      <code>Ctrl + Shift + B</code>
    </div>
    
    <div class="achievement-unlocked">
      <small>🏆 Achievement Unlocked: Terminal Explorer 🏆</small>
    </div>
  `;

  document.body.appendChild(notification);

  // Trigger show animation
  setTimeout(() => notification.classList.add('show'), 10);

  // Create celebration effects
  createCelebrationParticles();
  createConfettiBurst();
  playSuccessSound();

  // Auto-dismiss after 10 seconds
  const autoDismiss = setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 1000);
  }, 10000);

  // Allow clicking to dismiss early
  notification.addEventListener('click', () => {
    clearTimeout(autoDismiss); // Clear auto-dismiss timeout
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 500);
  });
}

// ===================================
// ANTI-SPAM PROTECTION
// ===================================

let spamProtection = {
  lastClickTime: 0,
  clickDelay: 300, // Minimum 300ms between clicks
  maxClicksPerSecond: 3,
  clickTimestamps: [],
  isSpamming: false,

  checkSpam() {
    const now = Date.now();
    this.clickTimestamps = this.clickTimestamps.filter(
      (time) => now - time < 1000
    );
    this.clickTimestamps.push(now);

    const isSpamming = this.clickTimestamps.length > this.maxClicksPerSecond;

    if (isSpamming && !this.isSpamming) {
      this.showSpamWarning();
      this.isSpamming = true;
      setTimeout(() => {
        this.isSpamming = false;
      }, 2000);
    }

    return isSpamming;
  },

  showSpamWarning() {
    const warning = document.createElement('div');
    warning.className = 'spam-warning-notification';
    warning.innerHTML = `
      <i class="fas fa-exclamation-triangle"></i>
      <span>Slow down! Enjoy the discovery process 🐢</span>
    `;

    document.body.appendChild(warning);

    setTimeout(() => warning.classList.add('show'), 10);
    setTimeout(() => {
      warning.classList.remove('show');
      setTimeout(() => warning.remove(), 400);
    }, 3000);
  },
};

// ===================================
// PROFILE IMAGE CLICK EASTER EGG - KONAMI CODE FOCUS
// ===================================
(function () {
  'use strict';

  let profileClickCount = 0;
  const CLICKS_NEEDED = 10; // Now 10 clicks total
  const CLUE_START_CLICK = 3; // Clue appears at 3rd click
  let hintLevel = 0;

  // Add Performance Monitoring
  const performanceMonitor = {
    activeElements: new Set(),
    maxElements: 100,

    addElement(element) {
      this.activeElements.add(element);
      if (this.activeElements.size > this.maxElements) {
        this.cleanupOldest();
      }
    },

    removeElement(element) {
      this.activeElements.delete(element);
    },

    cleanupOldest() {
      const elements = Array.from(this.activeElements);
      for (let i = 0; i < 10; i++) {
        // Remove 10 oldest elements
        if (elements[i] && elements[i].parentNode) {
          elements[i].parentNode.removeChild(elements[i]);
          this.activeElements.delete(elements[i]);
        }
      }
    },
  };

  // Add Enhanced Reset System
  function setupEnhancedReset() {
    let resetTimer = null;

    return {
      startResetTimer(duration = 5000) {
        if (resetTimer) {
          clearTimeout(resetTimer);
        }

        resetTimer = setTimeout(() => {
          console.log('🔄 Enhanced sequence reset');
          profileClickCount = 0;
          hintLevel = 0;
          hideSecretClue();
          updateClueTooltip();
          showSequenceReset();

          // Force cleanup of any lingering elements
          performanceMonitor.cleanupOldest();
        }, duration);
      },

      cancelReset() {
        if (resetTimer) {
          clearTimeout(resetTimer);
          resetTimer = null;
        }
      },

      immediateReset() {
        if (resetTimer) {
          clearTimeout(resetTimer);
        }
        profileClickCount = 0;
        hintLevel = 0;
        hideSecretClue();
        updateClueTooltip();
      },
    };
  }

  // Initialize enhanced reset system
  const resetSystem = setupEnhancedReset();

  // Konami-focused progression - Updated for 10 clicks
  const HINT_LEVELS = [
    {
      // Level 0-2 - Nothing happens (clicks 1-2)
      tooltip: '...',
      notification: '',
      animation: 'subtlePulse',
      showNotification: false, // No notification
    },
    {
      // Level 1 - Initial discovery (clicks 3-4)
      tooltip: 'You found something! Keep exploring...',
      notification: 'Secret discovered! Keep clicking to reveal more... 🔍',
      animation: 'gentleGlow',
      showNotification: true, // Notification on click 3 only
    },
    {
      // Level 2 - Direction hints (clicks 5-6)
      tooltip: 'Follow the arrow patterns... 🧭',
      notification: "Notice the arrow directions? There's a pattern... ↗️↙️",
      animation: 'softBounce',
      showNotification: true, // Notification on click 5 only
    },
    {
      // Level 3 - Konami sequence start (clicks 7-8)
      tooltip: 'Up, up, down, down...',
      notification: "It's a famous gaming sequence! Keep going... 🎮",
      animation: 'energeticPulse',
      showNotification: true, // Notification on click 7 only
    },
    {
      // Level 4 - Full arrow sequence (click 9)
      tooltip: '↑↑↓↓←→←→',
      notification: 'Almost there! Just need the final buttons... 🔄',
      animation: 'konamiReveal',
      showNotification: true, // Notification on click 9 only
    },
    {
      // Level 5 - Almost complete (click 10)
      tooltip: '↑↑↓↓←→←→BA - Complete the sequence!',
      notification: '🎮 ONE MORE CLICK! Complete the Konami Code!',
      animation: 'celebration',
      showNotification: true, // Notification on click 10 only
    },
    {
      // Level 6 - Master level
      tooltip: 'Konami Code: ↑↑↓↓←→←→BA (or Ctrl+Shift+B)',
      notification: '🏆 KONAMI CODE MASTER! Terminal unlocked!',
      animation: 'celebration',
      showNotification: true, // Final celebration
    },
  ];

  function initProfileClickEasterEgg() {
    const profileImg = document.querySelector('.profile-img');
    const secretClue = document.querySelector('.secret-clue');

    if (!profileImg) {
      console.log('Profile image not found - retrying...');
      setTimeout(initProfileClickEasterEgg, 100);
      return;
    }

    if (!secretClue) {
      console.log('Secret clue not found - retrying...');
      setTimeout(initProfileClickEasterEgg, 100);
      return;
    }

    console.log('Konami-focused easter egg initialized - 10 click system');

    profileImg.style.cursor = 'pointer';
    profileImg.style.userSelect = 'none';

    profileImg.addEventListener('click', function (e) {
      e.preventDefault();

      // SPAM PROTECTION - Check before incrementing
      const now = Date.now();
      if (now - spamProtection.lastClickTime < spamProtection.clickDelay) {
        return; // Ignore rapid clicks
      }
      spamProtection.lastClickTime = now;

      if (spamProtection.checkSpam()) {
        resetSystem.immediateReset(); // Reset sequence if spamming
        return; // Block if spamming
      }

      // Only increment once!
      profileClickCount++;

      // Cancel any existing reset timer
      resetSystem.cancelReset();

      console.log(`🎯 Click ${profileClickCount}/${CLICKS_NEEDED}`);

      // Konami-themed animations
      performKonamiClickAnimation(profileImg, profileClickCount);

      // Update hint level and check if it changed
      const levelChanged = updateHintLevel(); // CAPTURE THE RETURN VALUE

      // Show clue starting from 3rd click
      if (
        profileClickCount >= CLUE_START_CLICK &&
        profileClickCount < CLICKS_NEEDED
      ) {
        revealSecretClue();
      }

      if (profileClickCount >= CLICKS_NEEDED) {
        unlockKonamiSecret(secretClue);
      } else {
        // FIXED: ONLY show notification if level actually changed
        if (levelChanged && HINT_LEVELS[hintLevel].showNotification) {
          showKonamiHint();
        }

        // Update tooltip immediately after click
        updateClueTooltip();

        // USE ENHANCED RESET SYSTEM - This replaces the old resetTimer
        const resetDuration = spamProtection.isSpamming ? 3000 : 5000;
        resetSystem.startResetTimer(resetDuration);
      }
    });

    function unlockKonamiSecret(secretClue) {
      // Remove any existing Konami hint notifications
      const existingNotifications = document.querySelectorAll(
        '.konami-hint-notification'
      );
      existingNotifications.forEach((notification) => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      });

      secretClue.classList.add('revealed');
      secretClue.style.animation = 'konamiCelebration 2s ease';

      // MAKE SURE THIS IS CALLED!
      showEnhancedMasterNotification();
      createEpicCelebration();

      // FIX: Check if sessionStorage exists (corrected typo)
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('secretClueRevealed', 'true');
        sessionStorage.setItem('konamiMaster', 'true');
      }

      console.log('🎉 KONAMI MASTER ACHIEVED! 10-click sequence complete!');

      profileClickCount = 0;
      hintLevel = HINT_LEVELS.length - 1;
      updateClueTooltip();
    }

    // Secret clue click handler
    secretClue.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const existingOverlay = document.querySelector(
        '.mobile-secret-overlay, .mobile-cryptic-overlay, .mobile-special-overlay'
      );

      if (existingOverlay) {
        return;
      }

      if (window.innerWidth <= 768) {
        showMobileSecretPrompt();
      } else {
        showKonamiReminder();
      }
    });

    // Check if already revealed
    if (
      typeof seStorage !== 'undefined' &&
      seStorage.getItem('secretClueRevealed') === 'true'
    ) {
      secretClue.classList.add('revealed');
      hintLevel = HINT_LEVELS.length - 1;
      updateClueTooltip();
    }
  }

  function performKonamiClickAnimation(element, clickCount) {
    element.style.animation = 'none';

    // Extended Konami-themed animations for 10 clicks
    const animations = [
      'arrowUp 0.6s ease', // 1
      'arrowUp 0.6s ease', // 2
      'arrowDown 0.6s ease', // 3
      'arrowDown 0.6s ease', // 4
      'arrowLeft 0.6s ease', // 5
      'arrowRight 0.6s ease', // 6
      'arrowLeft 0.6s ease', // 7
      'arrowRight 0.6s ease', // 8
      'bButton 0.6s ease', // 9
      'aButton 0.6s ease', // 10
    ];

    const animation = animations[(clickCount - 1) % animations.length];
    element.style.animation = animation;

    // Create directional particles (more frequent for longer sequence)
    if (clickCount >= 2) {
      createDirectionalParticles(element, clickCount);
    }

    playKonamiSound(clickCount);
  }

  // UPDATED: Enhanced createDirectionalParticles with performance monitoring
  function createDirectionalParticles(element, count) {
    // Add performance check
    if (performanceMonitor.activeElements.size > 80) {
      console.log('🚫 Performance protection: Limiting particles');
      return;
    }

    const directions = ['↑', '↓', '←', '→', 'B', 'A'];
    const rect = element.getBoundingClientRect();

    for (let i = 0; i < Math.min(count, 4); i++) {
      // Reduced from 6 to 4 for performance
      const particle = document.createElement('div');
      particle.className = 'direction-particle';
      particle.textContent = directions[i % directions.length];
      particle.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        font-size: ${12 + count * 1.5}px;
        pointer-events: none;
        z-index: 10002;
        animation: floatDirection 1.2s ease-out forwards;
        opacity: 0.7;
        font-weight: bold;
        color: ${i >= 4 ? '#ff6b6b' : '#4ecdc4'}; // B and A in different color
      `;

      // Set random direction offset
      particle.style.setProperty('--dir-x', (Math.random() - 0.5) * 2);
      particle.style.setProperty('--dir-y', (Math.random() - 0.5) * 2);

      document.body.appendChild(particle);
      performanceMonitor.addElement(particle);

      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
          performanceMonitor.removeElement(particle);
        }
      }, 1200);
    }
  }

  function playKonamiSound(clickCount) {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // Extended Konami code melody-inspired tones for 10 clicks
      const tones = [
        523.25, 587.33, 659.25, 698.46, 783.99, 880.0, 987.77, 1046.5, 1174.66,
        1318.51,
      ];
      oscillator.frequency.setValueAtTime(
        tones[(clickCount - 1) % tones.length],
        audioCtx.currentTime
      );

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.3
      );

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Silent fallback
    }
  }

  function updateHintLevel() {
    const oldHintLevel = hintLevel; // Track previous level

    // FIXED: Each level should only apply to specific single clicks
    if (profileClickCount === 1 || profileClickCount === 2) {
      hintLevel = 0;
    } else if (profileClickCount === 3 || profileClickCount === 4) {
      hintLevel = 1;
    } else if (profileClickCount === 5 || profileClickCount === 6) {
      hintLevel = 2;
    } else if (profileClickCount === 7 || profileClickCount === 8) {
      hintLevel = 3;
    } else if (profileClickCount === 9) {
      hintLevel = 4;
    } else if (profileClickCount === 10) {
      hintLevel = 5;
    } else {
      hintLevel = 6;
    }

    console.log(
      `🎮 Konami hint level: ${oldHintLevel} -> ${hintLevel} (Click ${profileClickCount})`
    );

    const secretClue = document.querySelector('.secret-clue');
    if (secretClue && secretClue.classList.contains('revealed')) {
      updateClueTooltip();
    }

    return oldHintLevel !== hintLevel; // Return true if level changed
  }

  function revealSecretClue() {
    const secretClue = document.querySelector('.secret-clue');
    if (!secretClue.classList.contains('revealed')) {
      secretClue.classList.add('revealed');
      secretClue.style.animation = 'konamiReveal 1s ease';

      // Show initial clue notification
      const notification = document.createElement('div');
      notification.className = 'konami-hint-notification';
      notification.innerHTML = `
        <i class="fas fa-search"></i>
        <span>Secret discovered! Keep clicking...</span>
        <small>Progress: ${profileClickCount}/${CLICKS_NEEDED}</small>
      `;

      document.body.appendChild(notification);

      setTimeout(() => notification.classList.add('show'), 10);
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 400);
      }, 3000);
    }
  }

  function hideSecretClue() {
    const secretClue = document.querySelector('.secret-clue');
    secretClue.classList.remove('revealed');
  }

  function showSequenceReset() {
    const notification = document.createElement('div');
    notification.className = 'sequence-reset-notification';
    notification.innerHTML = `
    <i class="fas fa-redo"></i>
    <span>Sequence broken! Start over... 🔄</span>
  `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  function showKonamiReminder() {
    const reminders = [
      'Remember the Konami code?',
      '↑↑↓↓←→←→BA unlocks the terminal',
      'Try the classic gaming sequence',
      'The code from the 80s still works!',
      'Up, up, down, down, left, right, left, right, B, A',
    ];

    const reminder = reminders[Math.floor(Math.random() * reminders.length)];

    const notification = document.createElement('div');
    notification.className = 'konami-reminder-notification';
    notification.innerHTML = `
    <i class="fas fa-history"></i>
    <span>${reminder}</span>
  `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  function showKonamiHint() {
    const level = HINT_LEVELS[hintLevel];
    if (!level.showNotification) return;

    // Remove any existing notification
    const existingNotification = document.querySelector(
      '.konami-hint-notification'
    );
    if (existingNotification) {
      existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `konami-hint-notification level-${hintLevel}`;

    // Simple progress indicator without revealing too much
    const progressPercent = Math.min((profileClickCount / 10) * 100, 90);

    notification.innerHTML = `
    <button class="konami-hint-close" aria-label="Close notification">&times;</button>
    <i class="fas fa-${getKonamiIcon(hintLevel)}"></i>
    <span>${level.notification}</span>
    
    ${
      hintLevel >= 1 && hintLevel <= 4
        ? `
      <div class="konami-progress">
        <span>Exploring...</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progressPercent}%"></div>
        </div>
      </div>
    `
        : ''
    }
    
    ${
      hintLevel === 5
        ? `
      <small>Almost there! One more step...</small>
    `
        : ''
    }
  `;

    document.body.appendChild(notification);

    // Close button functionality
    notification
      .querySelector('.konami-hint-close')
      .addEventListener('click', (e) => {
        e.stopPropagation();
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      });

    // Auto-show
    setTimeout(() => notification.classList.add('show'), 10);

    // Auto-dismiss after appropriate time (shorter on mobile)
    const dismissTime = window.innerWidth <= 768 ? 3500 : 4000;
    const autoDismiss = setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, dismissTime);

    // Allow clicking to dismiss early (except on the close button)
    notification.addEventListener('click', (e) => {
      if (!e.target.closest('.konami-hint-close')) {
        clearTimeout(autoDismiss);
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }
    });
  }

  function getKonamiIcon(level) {
    const icons = [
      'question',
      'search',
      'compass',
      'arrows-alt',
      'project-diagram',
      'puzzle-piece',
      'trophy',
    ];
    return icons[level] || 'gamepad';
  }

  function updateClueTooltip() {
    const secretClue = document.querySelector('.secret-clue');
    if (!secretClue) return;

    const level = HINT_LEVELS[hintLevel];
    secretClue.setAttribute('data-hint-level', hintLevel);

    if (hintLevel >= 3) {
      secretClue.style.animation = `${level.animation} 2s ease`;
    }
  }

  function createEpicCelebration() {
    // Enhanced Konami-themed celebration
    const konamiChars = [
      '↑',
      '↓',
      '←',
      '→',
      'B',
      'A',
      '🎮',
      '👾',
      '🏆',
      '⭐',
      '⚡',
      '🔥',
    ];
    const colors = [
      '#ff6b6b',
      '#feca57',
      '#48dbfb',
      '#ff9ff3',
      '#1dd1a1',
      '#f368e0',
    ];

    // Create massive explosion of characters
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const firework = document.createElement('div');
        firework.className = 'konami-firework';
        firework.textContent =
          konamiChars[Math.floor(Math.random() * konamiChars.length)];
        firework.style.cssText = `
        position: fixed;
        left: ${Math.random() * window.innerWidth}px;
        top: ${Math.random() * window.innerHeight}px;
        font-size: ${20 + Math.random() * 20}px;
        pointer-events: none;
        z-index: 10003;
        animation: konamiExplode 2s ease-out forwards;
        font-weight: bold;
        color: ${colors[Math.floor(Math.random() * colors.length)]};
        text-shadow: 0 0 10px currentColor;
      `;

        document.body.appendChild(firework);
        setTimeout(() => firework.remove(), 2000);
      }, i * 50);
    }

    // Add celebration particles
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const particle = document.createElement('div');
        particle.className = 'celebration-particle';
        particle.textContent =
          konamiChars[Math.floor(Math.random() * konamiChars.length)];
        particle.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        font-size: ${15 + Math.random() * 15}px;
        pointer-events: none;
        z-index: 10003;
        color: ${colors[Math.floor(Math.random() * colors.length)]};
        font-weight: bold;
        --particle-x: ${(Math.random() - 0.5) * 300}px;
        --particle-y: ${(Math.random() - 0.5) * 300}px;
      `;

        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 2000);
      }, i * 100);
    }

    // Add confetti
    createConfetti();
  }

  function createConfetti() {
    const colors = [
      '#ff6b6b',
      '#feca57',
      '#48dbfb',
      '#ff9ff3',
      '#1dd1a1',
      '#f368e0',
    ];

    for (let i = 0; i < 150; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.cssText = `
        left: ${Math.random() * 100}vw;
        animation-delay: ${Math.random() * 2}s;
        --confetti-color: ${colors[Math.floor(Math.random() * colors.length)]};
        transform: rotate(${Math.random() * 360}deg);
      `;

        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
      }, i * 20);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileClickEasterEgg);
  } else {
    initProfileClickEasterEgg();
  }
})();

// ===================================
// TERMINAL EASTER EGG (Keep your existing code below)
// ===================================
(function () {
  'use strict';

  // Konami Code sequence
  const konamiCode = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a',
  ];
  let konamiIndex = 0;

  // Secret key combination: Ctrl + Shift + B
  const SECRET_KEYS = { ctrl: false, shift: false, b: false };

  // Terminal state
  let terminalActive = false;
  let commandHistory = [];
  let historyIndex = -1;

  // ASCII Art
  const ASCII_LOGO = `
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║        ██████╗  █████╗ ███████╗███████╗███╗   ███╗        ║
║        ██╔══██╗██╔══██╗██╔════╝██╔════╝████╗ ████║        ║
║        ██████╔╝███████║███████╗█████╗  ██╔████╔██║        ║
║        ██╔══██╗██╔══██║╚════██║██╔══╝  ██║╚██╔╝██║        ║
║        ██████╔╝██║  ██║███████║███████╗██║ ╚═╝ ██║        ║
║        ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚═╝     ╚═╝        ║
║                                                           ║
║                 SECRET DEVELOPER TERMINAL                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

  `;

  // Available commands
  const COMMANDS = {
    help: {
      desc: 'Show available commands',
      action: () => {
        return `
Available Commands:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  help        - Show this help message
  about       - Learn about the creator
  skills      - Display technical skills
  projects    - Show featured projects
  contact     - Get contact information
  secret      - Reveal the secret message
  matrix      - Activate the Matrix
  hack        - Initialize hacking sequence
  coffee      - Get a coffee ☕
  whoami      - Display user information
  clear       - Clear the terminal
  exit        - Close the terminal
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type any command to execute it!
`;
      },
    },
    about: {
      desc: 'Learn about the creator',
      action: () => {
        return `
╔════════════════════════════════════════╗
║         ABOUT THE DEVELOPER            ║
╚════════════════════════════════════════╝

Name: Basem Esam
Role: Backend Developer & CS Student
Location: Port Said, Egypt

Bio: A passionate backend developer with expertise in
Node.js, Express, and scalable system architecture.
Active in competitive programming (ICPC) and tech
communities (GDG, Mech Hackers).

Philosophy: "Code is poetry written in logic"

Fun Fact: Started building websites at age 11,
inspired by a teacher who believed in potential.

Current Mission: Building robust backend systems
that make a difference! 🚀
`;
      },
    },
    skills: {
      desc: 'Display technical skills',
      action: () => {
        return `
╔════════════════════════════════════════╗
║          TECHNICAL ARSENAL             ║
╚════════════════════════════════════════╝

Backend Development:
  ▸ Node.js         ████████████ 90%
  ▸ Express         ███████████░ 85%
  ▸ MongoDB         ██████████░░ 80%
  ▸ PHP/Laravel     ████████░░░░ 70%

DevOps & Tools:
  ▸ Docker          ███████░░░░░ 65%
  ▸ Kubernetes      ██████░░░░░░ 60%
  ▸ Git             ████████████ 95%
  ▸ Linux Admin     ████████░░░░ 75%

System Design:
  ▸ OOP             ███████████░ 85%
  ▸ Clean Arch      ████████░░░░ 75%
  ▸ REST APIs       ████████████ 90%

Special Abilities:
  ✓ Problem Solving
  ✓ Team Leadership
  ✓ Teaching & Mentoring
  ✓ Competitive Programming
`;
      },
    },
    projects: {
      desc: 'Show featured projects',
      action: () => {
        return `
╔════════════════════════════════════════╗
║         FEATURED PROJECTS              ║
╚════════════════════════════════════════╝

1. Trosc Student Club Website
   ├─ Backend infrastructure using Node.js
   ├─ RESTful API design
   └─ Database: MongoDB
   Status: ✓ Live & Running
   Link: https://trosc-scu.netlify.app/

2. Laravel E-commerce Platform
   ├─ Full-stack e-commerce solution
   ├─ PHP/Laravel backend
   └─ MySQL database
   Status: ✓ Completed
   Repo: github.com/Basem3sam/laravel-ecommerce-app

3. REST API Authentication System
   ├─ JWT-based authentication
   ├─ Role-based access control
   └─ Security best practices
   Status: ⚡ In Development

For more projects, visit:
→ github.com/basem3sam
`;
      },
    },
    contact: {
      desc: 'Get contact information',
      action: () => {
        return `
╔════════════════════════════════════════╗
║         CONTACT INFORMATION            ║
╚════════════════════════════════════════╝

📧 Email:
   basem.esam.omar@gmail.com

🔗 LinkedIn:
   linkedin.com/in/BasemEsam

💻 GitHub:
   github.com/basem3sam

📍 Location:
   Port Said, Egypt

🌐 Portfolio:
   You're already here! 😉

⚡ Status: Available for opportunities
   Open to: Backend Development Projects
           Remote Collaborations
           Freelance Work

Feel free to reach out! Always excited to
discuss technology, projects, or just grab
a virtual coffee ☕
`;
      },
    },
    secret: {
      desc: 'Reveal the secret message',
      action: () => {
        return `
╔════════════════════════════════════════╗
║          🎉 SECRET UNLOCKED 🎉         ║
╚════════════════════════════════════════╝

Congratulations! You've discovered the secret
terminal easter egg! 🎮

You are one of the few who think like a developer.
Curiosity and exploration are the hallmarks of
great engineers.

<span class="achievement-badge">🏆 Achievement Unlocked: Terminal Hacker</span>

Secret Message:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"The best developers are those who never stop
exploring, questioning, and learning. You've
proven you belong in that elite group."

  - Basem Esam

Fun Fact: This terminal was built with vanilla
JavaScript and has 15+ interactive commands!

Try typing: matrix, hack, or coffee for more fun!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
      },
    },
    matrix: {
      desc: 'Activate the Matrix',
      action: () => {
        // Add matrix effect class
        setTimeout(() => {
          const terminal = document.querySelector('.terminal-body');
          terminal.classList.add('glitch');
          setTimeout(() => terminal.classList.remove('glitch'), 1000);
        }, 100);

        return `
╔════════════════════════════════════════╗
║         MATRIX MODE ACTIVATED          ║
╚════════════════════════════════════════╝

Wake up, Neo...
The Matrix has you...
Follow the white rabbit. 🐰

Knock, knock, Neo.

01010111 01100001 01101011 01100101
01010101 01110000

<span class="terminal-success">System Status: Reality.exe has stopped working</span>
<span class="terminal-warning">WARNING: You are now in the Matrix</span>

Would you like to take the red pill or blue pill?

Just kidding! You're still in Basem's portfolio 😄
But that was cool, right?
`;
      },
    },
    hack: {
      desc: 'Initialize hacking sequence',
      action: async () => {
        const messages = [
          '<span class="terminal-warning">Initializing hack sequence...</span>',
          'Connecting to mainframe...',
          'Bypassing firewall...',
          '<span class="terminal-success">Access granted!</span>',
          'Downloading files...',
          'portfolio_secrets.zip [████████] 100%',
          'cool_developer_facts.txt [████████] 100%',
          '<span class="terminal-error">ERROR: Nice try, hacker! 😄</span>',
          '',
          '<span class="terminal-info">Just kidding! There\'s nothing to hack here.</span>',
          'But I appreciate your spirit! 🚀',
          '',
          'Real hacking is about building, not breaking.',
          'Want to build something cool together?',
          'Check out my GitHub: github.com/basem3sam',
        ];

        let result = '';
        messages.forEach((msg) => {
          result += msg + '\n';
        });
        return result;
      },
    },
    coffee: {
      desc: 'Get a coffee',
      action: () => {
        const coffeeArt = `
      )  (
     (   ) )
      ) ( (
    _______)_
 .-'---------|  
( C|/\\/\\/\\/\\/|
 '-./\\/\\/\\/\\/|
   '_________'
    '-------'
`;
        return `
${coffeeArt}

Here's a virtual coffee! ☕

<span class="terminal-success">Coffee.exe is brewing...</span>

Fun fact: Developers run on coffee and semicolons.

Error 418: I'm a teapot 🫖
Just kidding! Here's your coffee!

Enjoy coding! 💻
`;
      },
    },
    whoami: {
      desc: 'Display user information',
      action: () => {
        return `
╔════════════════════════════════════════╗
║          USER INFORMATION              ║
╚════════════════════════════════════════╝

Username: curious_developer
Role: Easter Egg Hunter
Level: Terminal Master
Status: IMPRESSED ✨

Achievements:
  ✓ Found the secret terminal
  ✓ Explored hidden features
  ✓ Thinks like a developer
  ✓ Has great taste in portfolios

Special Privileges:
  → Access to all terminal commands
  → Bragging rights for finding this
  → Respect from Basem Esam
  → Exclusive knowledge of portfolio secrets

You are: Awesome! 🌟
`;
      },
    },
    clear: {
      desc: 'Clear the terminal',
      action: () => {
        const output = document.getElementById('terminal-output');
        output.innerHTML = '';
        return null;
      },
    },
    exit: {
      desc: 'Close the terminal',
      action: () => {
        window.closeTerminal();
        return null;
      },
    },
  };

  // Initialize
  function init() {
    createTerminalHTML();
    setupEventListeners();
    console.log(
      '%c🎮 SECRET TERMINAL AVAILABLE!',
      'color: #00ff41; font-size: 16px; font-weight: bold;'
    );
    console.log(
      '%cPress Ctrl + Shift + B to open the terminal',
      'color: #00d9ff; font-size: 12px;'
    );
    console.log(
      '%cOr try the Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A',
      'color: #ffa502; font-size: 12px;'
    );
  }

  // Create terminal HTML
  function createTerminalHTML() {
    const terminalHTML = `
      <div class="terminal-backdrop" id="terminal-backdrop"></div>
      <div id="secret-terminal">
        <div class="terminal-header">
          <div class="terminal-title">
            <i class="fas fa-terminal"></i> BASEM_TERMINAL v1.0.0
          </div>
          <div class="terminal-buttons">
            <div class="terminal-btn close" onclick="window.closeTerminal()"></div>
            <div class="terminal-btn minimize"></div>
            <div class="terminal-btn maximize"></div>
          </div>
        </div>
        <div class="terminal-body">
          <div id="terminal-output" class="terminal-output"></div>
        </div>
        <div class="terminal-input-wrapper">
          <span class="terminal-input-prompt">guest@basem:~$</span>
          <input 
            type="text" 
            id="terminal-input" 
            autocomplete="off" 
            spellcheck="false"
            placeholder="Type 'help' for available commands..."
          />
        </div>
      </div>
      <div class="secret-clue">
        <i class="fas fa-terminal"></i>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', terminalHTML);
  }

  // Setup event listeners
  function setupEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('keyup', handleKeyRelease);

    // Terminal input
    const input = document.getElementById('terminal-input');
    if (input) {
      input.addEventListener('keydown', handleTerminalInput);
    }

    // Backdrop click to close
    const backdrop = document.getElementById('terminal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', closeTerminal);
    }

    // Make closeTerminal globally accessible
    window.closeTerminal = function () {
      terminalActive = false;
      const terminal = document.getElementById('secret-terminal');
      const backdrop = document.getElementById('terminal-backdrop');

      if (terminal) terminal.classList.remove('active');
      if (backdrop) backdrop.classList.remove('active');
    };
  }

  // Handle key press
  function handleKeyPress(e) {
    // Konami Code detection
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        window.openTerminal();
        konamiIndex = 0;
        // Clear any potential input that might have been captured
        const input = document.getElementById('terminal-input');
        if (input) input.value = '';
      }
    } else {
      konamiIndex = 0;
    }

    // Secret key combination: Ctrl + Shift + B
    if (e.ctrlKey) SECRET_KEYS.ctrl = true;
    if (e.shiftKey) SECRET_KEYS.shift = true;
    if (e.key.toLowerCase() === 'b') SECRET_KEYS.b = true;

    if (SECRET_KEYS.ctrl && SECRET_KEYS.shift && SECRET_KEYS.b) {
      e.preventDefault();
      window.openTerminal();
      resetSecretKeys();
    }
  }

  // Handle key release
  function handleKeyRelease(e) {
    if (e.key === 'Control') SECRET_KEYS.ctrl = false;
    if (e.key === 'Shift') SECRET_KEYS.shift = false;
    if (e.key.toLowerCase() === 'b') SECRET_KEYS.b = false;
  }

  // Reset secret keys
  function resetSecretKeys() {
    SECRET_KEYS.ctrl = false;
    SECRET_KEYS.shift = false;
    SECRET_KEYS.b = false;
  }

  // Handle terminal input
  function handleTerminalInput(e) {
    if (e.key === 'Enter') {
      const input = e.target;
      const command = input.value.trim().toLowerCase();

      if (command) {
        commandHistory.push(command);
        historyIndex = commandHistory.length;

        printLine(`guest@basem:~$ ${command}`, 'terminal-prompt');
        executeCommand(command);
      }

      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        e.target.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        e.target.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        e.target.value = '';
      }
    }
  }

  // Execute command
  function executeCommand(command) {
    if (COMMANDS[command]) {
      const result = COMMANDS[command].action();
      if (result !== null) {
        printLine(result);
      }
    } else if (command) {
      printLine(`Command not found: ${command}`, 'terminal-error');
      printLine('Type "help" for available commands.', 'terminal-info');
    }
  }

  // Print line to terminal
  function printLine(text, className = '') {
    const output = document.getElementById('terminal-output');
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = text;
    output.appendChild(line);

    // Auto-scroll to bottom
    const terminalBody = document.querySelector('.terminal-body');
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
