/**
 * GitHub API Integration - Enhanced Version
 * Fetches and displays GitHub repositories with advanced features
 * @author Basem Esam
 * @version 2.2.0
 */

(function () {
  'use strict';

  // Enhanced configuration
  const GITHUB_CONFIG = {
    // API Settings
    username: 'basem3sam',
    reposPerPage: 9,
    sortBy: 'updated',
    order: 'desc',
    apiUrl: 'https://api.github.com',

    // Cache Settings
    cacheKey: 'github_repos_enhanced_cache',
    cacheDuration: 15 * 60 * 1000, // 15 minutes
    cacheVersion: '2.0',

    // UI Settings
    animationDelay: 100,
    maxDescriptionLength: 120,
    retryAttempts: 3,
    retryDelay: 1000,

    // Feature Flags
    enableAnalytics: true,
    enableOfflineSupport: true,
    enableBackgroundSync: false,
  };

  // State management
  const GITHUB_STATE = {
    isLoading: false,
    hasError: false,
    retryCount: 0,
    lastUpdate: null,
    currentPage: 1,
    totalRepos: 0,
    abortController: null,
  };

  // Language color mapping
  const LANGUAGE_COLORS = {
    JavaScript: { bg: 'warning', text: 'dark' },
    TypeScript: { bg: 'primary', text: 'white' },
    Python: { bg: 'info', text: 'white' },
    Java: { bg: 'danger', text: 'white' },
    PHP: { bg: 'primary', text: 'white' },
    HTML: { bg: 'danger', text: 'white' },
    CSS: { bg: 'info', text: 'white' },
    Vue: { bg: 'success', text: 'white' },
    React: { bg: 'info', text: 'white' },
    Shell: { bg: 'secondary', text: 'white' },
    Dockerfile: { bg: 'primary', text: 'white' },
    Default: { bg: 'secondary', text: 'white' },
  };

  /**
   * Enhanced GitHub projects loader with retry mechanism
   */
  function loadGitHubProjects() {
    if (GITHUB_STATE.isLoading) {
      console.log('⚠️ GitHub load already in progress');
      return;
    }

    const container = document.getElementById('github-projects-container');
    const loadingSpinner = document.getElementById('github-loading');
    const fallback = document.getElementById('github-fallback');

    if (!container || !loadingSpinner) {
      console.warn('❌ GitHub container elements not found');
      return;
    }

    // Initialize state
    GITHUB_STATE.isLoading = true;
    GITHUB_STATE.hasError = false;
    GITHUB_STATE.abortController = new AbortController();

    // Show loading state
    showEnhancedLoading(loadingSpinner, true);
    hideFallback(fallback);

    // Try cache first (if enabled)
    if (GITHUB_CONFIG.enableOfflineSupport) {
      const cachedData = getEnhancedCachedData();
      if (cachedData) {
        console.log('💾 Loading GitHub repos from cache');
        GITHUB_STATE.lastUpdate = cachedData.timestamp;
        renderRepositoriesWithAnalytics(
          cachedData.data,
          container,
          loadingSpinner,
          fallback
        );
        GITHUB_STATE.isLoading = false;
        return;
      }
    }

    // Fetch from API with retry mechanism
    fetchWithRetry()
      .then((repos) => {
        // Cache successful response
        if (GITHUB_CONFIG.enableOfflineSupport) {
          cacheEnhancedData(repos);
        }

        // Track successful load
        if (GITHUB_CONFIG.enableAnalytics) {
          trackGitHubLoad('success', repos.length);
        }

        renderRepositoriesWithAnalytics(
          repos,
          container,
          loadingSpinner,
          fallback
        );
        console.log(`✅ Loaded ${repos.length} GitHub repositories`);
      })
      .catch((error) => {
        GITHUB_STATE.hasError = true;

        // Track failed load
        if (GITHUB_CONFIG.enableAnalytics) {
          trackGitHubLoad('error', 0, error.message);
        }

        handleEnhancedError(error, container, loadingSpinner, fallback);
      })
      .finally(() => {
        GITHUB_STATE.isLoading = false;
        GITHUB_STATE.abortController = null;
      });
  }

  /**
   * Fetch with retry mechanism and timeout
   */
  function fetchWithRetry() {
    return new Promise((resolve, reject) => {
      const attemptFetch = (attempt = 1) => {
        fetchGitHubRepositories()
          .then(resolve)
          .catch((error) => {
            if (
              attempt < GITHUB_CONFIG.retryAttempts &&
              !error.message.includes('abort')
            ) {
              console.log(
                `🔄 Retry attempt ${attempt}/${GITHUB_CONFIG.retryAttempts}`
              );
              setTimeout(
                () => attemptFetch(attempt + 1),
                GITHUB_CONFIG.retryDelay * attempt
              );
            } else {
              reject(error);
            }
          });
      };

      attemptFetch();
    });
  }

  /**
   * Enhanced GitHub API fetch with timeout and abort
   */
  function fetchGitHubRepositories() {
    const url = `${GITHUB_CONFIG.apiUrl}/users/${GITHUB_CONFIG.username}/repos?sort=${GITHUB_CONFIG.sortBy}&direction=${GITHUB_CONFIG.order}&per_page=${GITHUB_CONFIG.reposPerPage}&page=${GITHUB_STATE.currentPage}`;

    const fetchOptions = {
      method: 'GET',
      signal: GITHUB_STATE.abortController?.signal,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
    };

    // Add timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 10000)
    );

    const fetchPromise = fetch(url, fetchOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // Extract rate limit info
        const rateLimitRemaining = response.headers.get(
          'X-RateLimit-Remaining'
        );
        const rateLimitReset = response.headers.get('X-RateLimit-Reset');

        if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
          console.warn(
            `⚠️ GitHub API rate limit low: ${rateLimitRemaining} remaining`
          );
        }

        return response.json();
      })
      .then((repos) => {
        // Enhanced filtering and sorting
        return repos
          .filter((repo) => !repo.fork && !repo.archived)
          .sort((a, b) => {
            // Primary: Star count, Secondary: Update date
            if (b.stargazers_count !== a.stargazers_count) {
              return b.stargazers_count - a.stargazers_count;
            }
            return new Date(b.updated_at) - new Date(a.updated_at);
          })
          .map((repo) => ({
            ...repo,
            _processed: true,
            _languageColor: getLanguageColor(repo.language),
          }));
      });

    return Promise.race([fetchPromise, timeoutPromise]);
  }

  /**
   * Enhanced repository rendering with analytics
   */
  function renderRepositoriesWithAnalytics(
    repos,
    container,
    loadingSpinner,
    fallback
  ) {
    showEnhancedLoading(loadingSpinner, false);

    if (!repos || repos.length === 0) {
      showEnhancedFallback(fallback, 'No public repositories found.', 'info');
      return;
    }

    // Update state
    GITHUB_STATE.totalRepos = repos.length;
    GITHUB_STATE.lastUpdate = Date.now();

    // Clear container with fade effect
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.3s ease';

    setTimeout(() => {
      container.innerHTML = '';

      // Create repository cards with enhanced features
      repos.forEach((repo, index) => {
        const card = createEnhancedRepositoryCard(repo);
        container.appendChild(card);

        // Staggered animation with enhanced timing
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0) scale(1)';
        }, index * GITHUB_CONFIG.animationDelay);
      });

      // Restore container opacity
      setTimeout(() => {
        container.style.opacity = '1';
      }, 50);

      // Add view tracking
      if (GITHUB_CONFIG.enableAnalytics) {
        trackRepositoriesView(repos);
      }
    }, 300);
  }

  /**
   * Create enhanced repository card with more details
   */
  function createEnhancedRepositoryCard(repo) {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 mb-4 github-repo-card';
    col.style.opacity = '0';
    col.style.transform = 'translateY(20px) scale(0.95)';
    col.style.transition =
      'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

    // Enhanced data processing
    const updatedDate = formatEnhancedDate(repo.updated_at);
    const createdDate = formatEnhancedDate(repo.created_at);
    const description = truncateDescription(repo.description);
    const repoName = formatRepositoryName(repo.name);
    const languageColor = repo._languageColor || LANGUAGE_COLORS.Default;

    col.innerHTML = `
      <div class="project-card card h-100" data-repo-id="${
        repo.id
      }" data-repo-name="${sanitizeHTML(repo.name)}">
        <div class="card-body d-flex flex-column position-relative">
          <!-- Repository Header -->
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h5 class="card-title mb-0 flex-grow-1 me-2">${sanitizeHTML(
              repoName
            )}</h5>
            ${repo.archived ? createArchivedBadge() : ''}
          </div>
          
          <!-- Repository Description -->
          <p class="card-text flex-grow-1 text-muted">${description}</p>
          
          <!-- Repository Metadata -->
          <div class="mb-3">
            <!-- Language and Topics -->
            <div class="mb-2">
              ${
                repo.language
                  ? createEnhancedLanguageBadge(repo.language, languageColor)
                  : ''
              }
              ${
                repo.topics && repo.topics.length > 0
                  ? createTopicsBadges(repo.topics)
                  : ''
              }
            </div>
            
            <!-- Repository Stats -->
            <div class="d-flex flex-wrap gap-2">
              ${createEnhancedStatsBadge(
                'star',
                repo.stargazers_count,
                'Stars'
              )}
              ${createEnhancedStatsBadge(
                'code-branch',
                repo.forks_count,
                'Forks'
              )}
              ${
                repo.watchers_count > 0
                  ? createEnhancedStatsBadge(
                      'eye',
                      repo.watchers_count,
                      'Watchers'
                    )
                  : ''
              }
              ${
                repo.open_issues_count > 0
                  ? createEnhancedStatsBadge(
                      'exclamation-circle',
                      repo.open_issues_count,
                      'Issues',
                      'warning'
                    )
                  : ''
              }
              <!--${
                repo.size ? createSizeBadge(repo.size) : ''
              }--> <!--i dont want size but keeping it cus its cool to know-->
            </div>
          </div>
          
          <!-- Repository Footer -->
          <div class="mt-auto">
            <div class="d-flex justify-content-between align-items-center text-muted small mb-2">
              <span>
                <i class="fas fa-calendar me-1" aria-hidden="true"></i>
                Created: ${createdDate}
              </span>
              <span>
                <i class="fas fa-clock me-1" aria-hidden="true"></i>
                Updated: ${updatedDate}
              </span>
            </div>
            
            <!-- Action Buttons -->
            <div class="button-group">
              <a href="${repo.html_url}" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="btn btn-sm btn-primary flex-grow-1"
                 aria-label="View ${repoName} on GitHub"
                 data-analytics="github-repo-view"
                 data-repo-name="${repo.name}">
                <i class="fab fa-github me-1" aria-hidden="true"></i>
                View on GitHub
              </a>
              ${
                repo.homepage
                  ? createEnhancedLiveDemoButton(repo.homepage, repoName)
                  : ''
              }
            </div>
          </div>
          
          <!-- Hover Effects -->
          <div class="card-hover-effects"></div>
        </div>
      </div>
    `;

    // Add interactive features
    addCardInteractions(col, repo);

    return col;
  }

  /**
   * Enhanced language badge with color coding
   */
  function createEnhancedLanguageBadge(language, colorConfig) {
    return `
      <span class="badge ${
        colorConfig.bg ? `bg-${colorConfig.bg}` : 'bg-secondary'
      } 
                          ${colorConfig.text ? `text-${colorConfig.text}` : ''} 
                          me-1 language-badge"
            style="${getLanguageColorStyle(language)}"
            title="Primary language: ${language}">
        ${sanitizeHTML(language)}
      </span>
    `;
  }

  /**
   * Enhanced stats badge with tooltips
   */
  function createEnhancedStatsBadge(icon, count, label, variant = 'light') {
    const textClass = variant === 'light' ? 'text-dark' : 'text-white';
    return `
      <span class="badge bg-${variant} ${textClass} stat-badge"
            title="${label}: ${count.toLocaleString()}">
        <i class="fas fa-${icon} me-1" aria-hidden="true"></i>
        ${count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
      </span>
    `;
  }

  /**
   * Create topics badges
   */
  function createTopicsBadges(topics) {
    const displayTopics = topics.slice(0, 3); // Show max 3 topics
    return displayTopics
      .map(
        (topic) =>
          `<span class="badge bg-light text-dark me-1 topic-badge">${sanitizeHTML(
            topic
          )}</span>`
      )
      .join('');
  }

  /**
   * Create repository size badge
   */
  function createSizeBadge(size) {
    const sizeInKB = Math.round(size / 1024);
    return `
      <span class="badge bg-light text-dark stat-badge" title="Repository size: ${sizeInKB} KB">
        <i class="fas fa-weight me-1" aria-hidden="true"></i>
        ${sizeInKB}KB
      </span>
    `;
  }

  /**
   * Enhanced live demo button
   */
  function createEnhancedLiveDemoButton(url, repoName) {
    return `
      <a href="${sanitizeHTML(url)}" 
         target="_blank" 
         rel="noopener noreferrer nofollow"
         class="btn btn-sm btn-outline-primary"
         aria-label="View live demo of ${repoName}"
         data-analytics="github-demo-view"
         data-repo-name="${repoName}">
        <i class="fas fa-external-link-alt me-1" aria-hidden="true"></i>
        Demo
      </a>
    `;
  }

  /**
   * Create archived repository badge
   */
  function createArchivedBadge() {
    return `<span class="badge bg-warning text-dark" title="This repository is archived">Archived</span>`;
  }

  /**
   * Enhanced date formatting
   */
  function formatEnhancedDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30)
      return `${Math.floor(diffDays / 7)} week${
        Math.floor(diffDays / 7) > 1 ? 's' : ''
      } ago`;
    if (diffDays < 365)
      return `${Math.floor(diffDays / 30)} month${
        Math.floor(diffDays / 30) > 1 ? 's' : ''
      } ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Enhanced error handling
   */
  function handleEnhancedError(error, container, loadingSpinner, fallback) {
    console.error('❌ GitHub API Error:', error);
    showEnhancedLoading(loadingSpinner, false);

    let message = 'Unable to load GitHub projects at this time.';
    let type = 'error';

    if (error.message.includes('404')) {
      message = 'GitHub user not found. Please check the username.';
      type = 'warning';
    } else if (error.message.includes('403')) {
      message = 'GitHub API rate limit exceeded. Please try again in an hour.';
      type = 'warning';
    } else if (error.message.includes('timeout')) {
      message = 'Request timeout. Please check your connection and try again.';
      type = 'warning';
    } else if (error.message.includes('abort')) {
      message = 'Request was cancelled.';
      type = 'info';
    }

    showEnhancedFallback(fallback, message, type);

    // Show retry button for certain errors
    if (!error.message.includes('404') && !error.message.includes('abort')) {
      addRetryButton(fallback);
    }
  }

  /**
   * Add retry button to fallback
   */
  function addRetryButton(fallback) {
    if (!fallback) return;

    const retryButton = document.createElement('button');
    retryButton.className = 'btn btn-primary mt-2';
    retryButton.textContent = 'Try Again';
    retryButton.addEventListener('click', () => {
      GITHUB_STATE.retryCount++;
      loadGitHubProjects();
    });

    fallback.appendChild(retryButton);
  }

  /**
   * Enhanced caching with versioning
   */
  function cacheEnhancedData(data) {
    try {
      const cacheObject = {
        data: data,
        timestamp: Date.now(),
        version: GITHUB_CONFIG.cacheVersion,
        username: GITHUB_CONFIG.username,
      };
      localStorage.setItem(GITHUB_CONFIG.cacheKey, JSON.stringify(cacheObject));
    } catch (e) {
      console.warn('⚠️ Failed to cache GitHub data:', e);
    }
  }

  /**
   * Enhanced cache retrieval with validation
   */
  function getEnhancedCachedData() {
    try {
      const cached = localStorage.getItem(GITHUB_CONFIG.cacheKey);
      if (!cached) return null;

      const cacheObject = JSON.parse(cached);
      const age = Date.now() - cacheObject.timestamp;

      // Validate cache
      const isValid =
        age < GITHUB_CONFIG.cacheDuration &&
        cacheObject.version === GITHUB_CONFIG.cacheVersion &&
        cacheObject.username === GITHUB_CONFIG.username;

      if (isValid) {
        return cacheObject;
      }

      // Clear invalid cache
      localStorage.removeItem(GITHUB_CONFIG.cacheKey);
      return null;
    } catch (e) {
      console.warn('⚠️ Failed to read GitHub cache:', e);
      return null;
    }
  }

  /**
   * Utility functions
   */
  function getLanguageColor(language) {
    return LANGUAGE_COLORS[language] || LANGUAGE_COLORS.Default;
  }

  function getLanguageColorStyle(language) {
    // This would integrate with a proper language color API
    return '';
  }

  function truncateDescription(description) {
    const cleanDescription = sanitizeHTML(
      description || 'No description available.'
    );
    return cleanDescription.length > GITHUB_CONFIG.maxDescriptionLength
      ? cleanDescription.substring(0, GITHUB_CONFIG.maxDescriptionLength) +
          '...'
      : cleanDescription;
  }

  function formatRepositoryName(name) {
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .replace(/\b(Js|Ts|Api|Ui|Ux|Db|Css|Html)\b/gi, (match) =>
        match.toUpperCase()
      );
  }

  function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
  }

  function showEnhancedLoading(spinner, show) {
    if (spinner) {
      spinner.style.display = show ? 'block' : 'none';
      spinner.setAttribute('aria-hidden', !show);
    }
  }

  function showEnhancedFallback(fallback, message, type = 'error') {
    if (fallback) {
      fallback.className = `github-fallback text-center p-4 bg-${
        type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'info'
      } bg-opacity-10 rounded`;
      fallback.innerHTML = `
        <i class="fab fa-github fa-2x mb-3 text-${
          type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'info'
        }" aria-hidden="true"></i>
        <p class="mb-3">${message}</p>
      `;
      fallback.classList.remove('d-none');
    }
  }

  function hideFallback(fallback) {
    if (fallback) {
      fallback.classList.add('d-none');
    }
  }

  function addCardInteractions(cardElement, repo) {
    // Click analytics
    cardElement.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') return; // Don't track link clicks twice

      const repoLink = cardElement.querySelector(
        'a[data-analytics="github-repo-view"]'
      );
      if (repoLink) {
        // Track card clicks
        if (GITHUB_CONFIG.enableAnalytics) {
          trackRepositoryClick(repo.name, 'card');
        }
      }
    });
  }

  /**
   * Analytics functions (optional)
   */
  function trackGitHubLoad(status, repoCount, errorMessage = '') {
    // Implement your analytics here
    console.log('📊 GitHub Load:', { status, repoCount, errorMessage });
  }

  function trackRepositoriesView(repos) {
    // Implement view tracking
    console.log('📊 Repositories View:', { count: repos.length });
  }

  function trackRepositoryClick(repoName, source) {
    // Implement click tracking
    console.log('📊 Repository Click:', { repoName, source });
  }

  /**
   * Public API
   */
  window.githubAPI = {
    // Core functions
    loadProjects: loadGitHubProjects,
    refreshProjects: () => {
      localStorage.removeItem(GITHUB_CONFIG.cacheKey);
      loadGitHubProjects();
    },

    // Configuration
    updateConfig: (newConfig) => {
      Object.assign(GITHUB_CONFIG, newConfig);
    },

    // Getters
    getState: () => ({ ...GITHUB_STATE }),
    getConfig: () => ({ ...GITHUB_CONFIG }),

    // Utility
    clearCache: () => {
      localStorage.removeItem(GITHUB_CONFIG.cacheKey);
    },
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGitHubProjects);
  } else {
    // Use requestIdleCallback for non-critical initialization
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadGitHubProjects());
    } else {
      setTimeout(loadGitHubProjects, 1000);
    }
  }
})();
