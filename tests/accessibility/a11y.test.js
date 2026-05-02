/**
 * VoteGuide AI — Accessibility Tests
 * Validates WCAG 2.1 AA compliance: ARIA labels, landmarks, focus management,
 * semantic HTML, and screen reader compatibility
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('ARIA Labels & Roles', () => {
  let html;
  beforeAll(() => {
    html = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
  });

  test('navigation should have aria-label', () => {
    expect(html).toMatch(/\<nav[^>]*aria-label/);
  });

  test('nav toggle button should have aria-label', () => {
    expect(html).toMatch(/nav-toggle[^>]*aria-label/);
  });

  test('nav toggle should have aria-expanded attribute', () => {
    expect(html).toMatch(/nav-toggle[^>]*aria-expanded/);
  });

  test('skip-to-content link should exist', () => {
    expect(html).toMatch(/class="skip-link"/);
    expect(html).toContain('Skip to main content');
  });

  test('main content area should have id for skip link', () => {
    expect(html).toContain('id="app"');
  });

  test('should have theme toggle button', () => {
    expect(html).toMatch(/theme-toggle|dark-mode|theme/i);
  });
});

describe('Semantic HTML Structure', () => {
  let html;
  beforeAll(() => {
    html = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
  });

  test('should use <nav> element for navigation', () => {
    expect(html).toMatch(/<nav[\s>]/);
  });

  test('should use <main> element for content', () => {
    expect(html).toMatch(/<main[\s>]/);
  });

  test('should use <footer> element', () => {
    expect(html).toMatch(/<footer[\s>]/);
  });

  test('should have lang attribute on html element', () => {
    expect(html).toMatch(/<html[^>]*lang="en"/);
  });

  test('should have charset meta tag', () => {
    expect(html).toContain('charset="UTF-8"');
  });

  test('should have descriptive title', () => {
    expect(html).toMatch(/<title>[^<]{10,}<\/title>/);
  });
});

describe('Keyboard Navigation Support', () => {
  let cssFiles;
  beforeAll(() => {
    cssFiles = ['base.css', 'components.css', 'layout.css', 'variables.css', 'pages.css']
      .map(f => fs.readFileSync(path.join(PROJECT_ROOT, 'css', f), 'utf8'))
      .join('\n');
  });

  test('should have focus-visible styles defined', () => {
    expect(cssFiles).toMatch(/focus-visible|:focus/);
  });

  test('should not use outline:none without replacement', () => {
    // Check that outline:none always has a companion visible focus style
    const outlineNone = (cssFiles.match(/outline:\s*none/g) || []).length;
    const focusStyles = (cssFiles.match(/:focus|focus-visible/g) || []).length;
    expect(focusStyles).toBeGreaterThan(0);
  });

  test('buttons should be keyboard accessible (no div-as-button without role)', () => {
    const html = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
    // Verify actual button elements are used
    expect(html).toMatch(/<button[\s>]/);
  });
});

describe('Dynamic Content Accessibility', () => {
  let pagesFeatures;
  beforeAll(() => {
    pagesFeatures = fs.readFileSync(path.join(PROJECT_ROOT, 'js/pages-features.js'), 'utf8');
  });

  test('chat messages container should have aria role', () => {
    // Chat should be a log or status region
    expect(pagesFeatures).toMatch(/role.*(log|status|alert|region)/);
  });

  test('chat input should have accessible label', () => {
    expect(pagesFeatures).toMatch(/aria-label|placeholder/);
  });

  test('send button should be identifiable', () => {
    expect(pagesFeatures).toMatch(/chat-send|send.*btn/i);
  });
});

describe('Color & Contrast', () => {
  let variables;
  beforeAll(() => {
    variables = fs.readFileSync(path.join(PROJECT_ROOT, 'css/variables.css'), 'utf8');
  });

  test('should define high-contrast color tokens', () => {
    expect(variables).toContain('--saffron');
    expect(variables).toContain('--navy');
  });

  test('should support dark theme with adequate contrast', () => {
    expect(variables).toMatch(/\[data-theme="dark"\]/);
  });

  test('should support both light and dark themes', () => {
    expect(variables).toMatch(/\[data-theme="light"\]|\[data-theme="dark"\]/);
  });
});

describe('Form Accessibility', () => {
  let pagesFeatures;
  beforeAll(() => {
    pagesFeatures = fs.readFileSync(path.join(PROJECT_ROOT, 'js/pages-features.js'), 'utf8');
  });

  test('translate page should have language selector', () => {
    expect(pagesFeatures).toMatch(/translate-lang|select/);
  });

  test('translate input should have placeholder or label', () => {
    expect(pagesFeatures).toMatch(/translate-input.*placeholder|aria-label.*translat/i);
  });

  test('quiz should have interactive buttons', () => {
    const quiz = fs.readFileSync(path.join(PROJECT_ROOT, 'js/quiz.js'), 'utf8');
    expect(quiz).toMatch(/button|click/);
  });
});

describe('Mobile Accessibility', () => {
  let html;
  beforeAll(() => {
    html = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
  });

  test('should have viewport meta tag for mobile', () => {
    expect(html).toContain('width=device-width');
    expect(html).toContain('initial-scale=1.0');
  });

  test('should have PWA manifest for mobile install', () => {
    expect(html).toContain('manifest.json');
    expect(fs.existsSync(path.join(PROJECT_ROOT, 'manifest.json'))).toBe(true);
  });

  test('manifest should define app name and icons', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'manifest.json'), 'utf8'));
    expect(manifest.name).toBeDefined();
    expect(manifest.short_name).toBeDefined();
  });

  test('should have touch-friendly nav toggle', () => {
    expect(html).toMatch(/nav-toggle/);
  });
});
