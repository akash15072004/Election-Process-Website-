/**
 * @module Router
 * @description VoteGuide AI — Custom Hash-Based SPA Router.
 * Provides client-side routing without framework dependencies by intercepting
 * hashchange events and mapping URL hashes to page render handlers.
 * @version 1.0.0
 */

/**
 * Lightweight hash-based Single Page Application router.
 * Intercepts `hashchange` events and delegates to registered route handlers.
 * Includes 404 fallback, active link highlighting, and mobile drawer management.
 */
export class Router {
  constructor() {
    /** @type {Object<string, Function>} Route path to handler mapping */
    this.routes = {};
    /** @type {string} Currently active route path */
    this.currentRoute = '';
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  /**
   * Registers a route path with its handler function.
   * @param {string} path - The URL hash path (e.g., '/ai-assistant')
   * @param {Function} handler - Async function to execute when route is matched
   */
  register(path, handler) {
    this.routes[path] = handler;
  }

  /**
   * Programmatically navigates to a route by updating the URL hash.
   * @param {string} path - The target route path
   */
  navigate(path) {
    window.location.hash = path;
  }

  /**
   * Handles the routing logic by parsing the hash, updating DOM states
   * (active classes/mobile menus), and executing the registered handler.
   */
  handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    this.currentRoute = hash;

    // Update active nav link (primary links)
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${hash}`);
    });

    // Update active state for dropdown items and their triggers
    document.querySelectorAll('.nav-dropdown-item').forEach(item => {
      const isActive = item.getAttribute('href') === `#${hash}`;
      item.classList.toggle('active', isActive);
    });

    // Highlight dropdown trigger if any child is active
    document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
      const hasActiveChild = dropdown.querySelector('.nav-dropdown-item.active');
      dropdown.querySelector('.nav-dropdown-trigger')?.classList.toggle('active', !!hasActiveChild);
    });

    // Close mobile menu
    const wrapper = document.querySelector('.nav-links-wrapper');
    const toggle = document.querySelector('.nav-toggle');
    const backdrop = document.getElementById('drawer-backdrop');
    if (wrapper) wrapper.classList.remove('open');
    if (toggle) toggle.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');

    // Execute route handler
    if (this.routes[hash]) {
      this.routes[hash]();
    } else {
      // 404 Not Found Fallback
      const appEl = document.getElementById('app');
      if (appEl) {
        appEl.innerHTML = `
          <section class="page-section" style="min-height: 70vh; display: flex; align-items: center; justify-content: center; text-align: center;">
            <div class="container">
              <div style="font-size: 80px; margin-bottom: 20px;">🕵️‍♂️</div>
              <h1 style="font-size: 3rem; color: var(--navy-800); margin-bottom: 16px;">404 - Page Not Found</h1>
              <p style="color: var(--gray-600); font-size: 1.2rem; max-width: 500px; margin: 0 auto 32px;">
                The election booth you're looking for seems to have been relocated. Let's get you back on track.
              </p>
              <a href="#/" class="btn btn-primary btn-lg">Return to Home 🏠</a>
            </div>
          </section>`;
        window.scrollTo(0, 0);
      }
    }
  }

  init() {
    this.handleRoute();
  }
}
