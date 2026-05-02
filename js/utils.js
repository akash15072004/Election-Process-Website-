/**
 * @module Utils
 * @description VoteGuide AI — Shared Utility Functions.
 * Provides HTML sanitization (XSS prevention), toast notifications, scroll animations,
 * page transitions, debouncing, date formatting, and AI response formatting.
 * @version 1.0.0
 */

/**
 * Sanitizes a string by escaping all 5 dangerous HTML characters to prevent XSS attacks.
 * Used for all user-supplied data (display names, emails, text content) before DOM injection.
 * @param {string} str - The untrusted string to sanitize
 * @returns {string} The HTML-escaped safe string, or empty string for non-string input
 */
export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Displays a transient toast notification.
 * Auto-creates the container element if it doesn't exist in the DOM.
 * @param {string} message - The notification message to display
 * @param {'success'|'error'|'warning'|'info'} [type='info'] - Toast severity level
 */
export function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/**
 * Animates a numeric counter from 0 to a target value with eased timing.
 * @param {HTMLElement} el - The DOM element whose textContent will be updated
 * @param {number} target - The target number to count up to
 * @param {number} [duration=1500] - Animation duration in milliseconds
 */
export function animateCounter(el, target, duration = 1500) {
  const start = 0;
  const startTime = performance.now();
  const suffix = el.dataset.suffix || '';
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(eased * target);
    el.textContent = current.toLocaleString('en-IN') + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

/**
 * Initializes IntersectionObserver-based scroll reveal animations.
 * Elements with the `.reveal` class get `.revealed` when they enter the viewport.
 * Also triggers counter animations on elements with `data-counter` attributes.
 * @returns {IntersectionObserver} The observer instance for cleanup
 */
export function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Trigger counter animation on self or children
        if (entry.target.dataset.counter) {
          animateCounter(entry.target, parseInt(entry.target.dataset.counter));
        }
        entry.target.querySelectorAll('[data-counter]').forEach(el => {
          if (!el.dataset.counted) {
            el.dataset.counted = '1';
            animateCounter(el, parseInt(el.dataset.counter));
          }
        });
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  return observer;
}

/**
 * Wraps a render function with a smooth fade-out/fade-in page transition.
 * Scrolls to top and reinitializes scroll reveal after rendering.
 * @param {Function} renderFn - The function that renders the new page content
 */
export function pageTransition(renderFn) {
  const app = document.getElementById('app');
  app.style.opacity = '0';
  app.style.transform = 'translateY(10px)';
  setTimeout(() => {
    renderFn();
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => {
      app.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
      app.style.opacity = '1';
      app.style.transform = 'translateY(0)';
    });
    setTimeout(() => initScrollReveal(), 100);
  }, 150);
}

/**
 * Creates a debounced version of a function that delays invocation.
 * @param {Function} fn - The function to debounce
 * @param {number} [delay=300] - Delay in milliseconds
 * @returns {Function} The debounced function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Formats a date string into Indian locale format (e.g., "28 April 2026").
 * @param {string} dateStr - A date string parseable by the Date constructor
 * @returns {string} The formatted date string in en-IN locale
 */
export function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Converts markdown-formatted AI responses to styled HTML for display.
 * Handles headers, bold, italic, links, tables, lists, and horizontal rules.
 * @param {string} text - Raw markdown text from the AI response
 * @returns {string} Formatted HTML string ready for DOM injection
 */
export function formatAIResponse(text) {
  if (!text) return '';
  let s = text;
  
  // Headers: ### Title → styled heading
  s = s.replace(/^#{1,6}\s+(.+)$/gm, '<strong style="display:block;font-size:1.1rem;margin:14px 0 8px;color:var(--saffron-400)">$1</strong>');
  
  // Bold: **text** → <strong>
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic: *text* → <em> (safe because bold was replaced above)
  s = s.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
  
  // Markdown links: [text](url) → <a>
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:var(--saffron-400)">$1</a>');
  
  // Horizontal rule: ---
  s = s.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:12px 0">');
  
  // Table rows
  s = s.replace(/^\|(.+)\|$/gm, (m, inner) => {
    const cells = inner.split('|').map(c => c.trim()).filter(Boolean);
    if (cells.every(c => /^[-:]+$/.test(c))) return '';
    return '<div style="display:flex;gap:12px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.08)">' + cells.map(c => '<span style="flex:1">' + c + '</span>').join('') + '</div>';
  });
  
  // Bullet lists
  s = s.replace(/^[\-\*] (.+)$/gm, '<div style="padding:2px 0 2px 16px">• $1</div>');
  
  // Numbered lists
  s = s.replace(/^(\d+)\. (.+)$/gm, '<div style="padding:2px 0 2px 16px">$1. $2</div>');
  
  // Double newlines → paragraph
  s = s.replace(/\n\n/g, '</p><p style="margin:8px 0">');
  
  // Single newlines → br
  s = s.replace(/\n/g, '<br>');
  
  // Final brute-force cleanup of any leftover markdown symbols
  s = s.replace(/<br>#{1,6}\s*/g, '<br>');
  s = s.replace(/^#{1,6}\s*/g, '');
  s = s.replace(/\*\*/g, ''); // strip any unmatched double asterisks
  s = s.replace(/(^|\s)\*(?=\s|$)/g, ' '); // strip stray single asterisks used as bullets
  s = s.replace(/#/g, ''); // strip any remaining hash symbols
  
  return s;
}
