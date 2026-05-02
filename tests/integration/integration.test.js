/**
 * VoteGuide AI — Integration Tests
 * Validates project structure, file integrity, and configuration consistency
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('Project Structure Integrity', () => {
  const requiredFiles = [
    'index.html',
    'firebase.json',
    'firestore.rules',
    'package.json',
    '.gitignore',
    'README.md',
    'js/app.js',
    'js/router.js',
    'js/utils.js',
    'js/auth.js',
    'js/ai-assistant.js',
    'js/firebase-config.js',
    'js/pages-home.js',
    'js/pages-features.js',
    'js/data.js',
    'css/variables.css',
    'css/base.css',
    'css/layout.css',
    'css/components.css',
    'css/pages.css',
  ];

  test.each(requiredFiles)('should contain required file: %s', (file) => {
    expect(fs.existsSync(path.join(PROJECT_ROOT, file))).toBe(true);
  });
});

describe('HTML Document Structure', () => {
  let html;
  beforeAll(() => {
    html = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
  });

  test('should have DOCTYPE declaration', () => {
    expect(html.trimStart()).toMatch(/^<!DOCTYPE html>/i);
  });

  test('should have lang attribute for accessibility', () => {
    expect(html).toMatch(/<html[^>]*lang=/);
  });

  test('should have viewport meta tag for mobile responsiveness', () => {
    expect(html).toContain('viewport');
    expect(html).toContain('width=device-width');
  });

  test('should have a title tag', () => {
    expect(html).toMatch(/<title>[^<]+<\/title>/);
  });

  test('should have meta description for SEO', () => {
    expect(html).toMatch(/<meta[^>]*name="description"/i);
  });

  test('should have a single main content area', () => {
    expect(html).toContain('id="app"');
  });

  test('should load app.js as module', () => {
    expect(html).toMatch(/<script[^>]*type="module"[^>]*src="[^"]*app\.js"/);
  });

  test('should include all CSS files', () => {
    expect(html).toContain('variables.css');
    expect(html).toContain('base.css');
    expect(html).toContain('layout.css');
    expect(html).toContain('components.css');
    expect(html).toContain('pages.css');
  });
});

describe('Firebase Configuration', () => {
  let config;
  beforeAll(() => {
    config = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'firebase.json'), 'utf8'));
  });

  test('should have hosting configuration', () => {
    expect(config.hosting).toBeDefined();
  });

  test('should have SPA rewrite rule', () => {
    const rewrite = config.hosting.rewrites?.find(r => r.source === '**');
    expect(rewrite).toBeDefined();
    expect(rewrite.destination).toBe('/index.html');
  });

  test('should reference firestore rules', () => {
    expect(config.firestore).toBeDefined();
    expect(config.firestore.rules).toBe('firestore.rules');
  });

  // Note: functions config removed — Cloud Functions were not used by frontend

  test('should ignore sensitive files in hosting', () => {
    expect(config.hosting.ignore).toContain('**/node_modules/**');
  });
});

describe('CSS Design System', () => {
  let variables;
  beforeAll(() => {
    variables = fs.readFileSync(path.join(PROJECT_ROOT, 'css/variables.css'), 'utf8');
  });

  test('should define color tokens', () => {
    expect(variables).toContain('--navy');
    expect(variables).toContain('--saffron');
    expect(variables).toContain('--emerald');
  });

  test('should define typography tokens', () => {
    expect(variables).toContain('--font-heading');
  });

  test('should define spacing tokens', () => {
    expect(variables).toContain('--space-');
  });

  test('should support dark theme', () => {
    expect(variables).toContain('[data-theme="dark"]');
  });
});

describe('Routing Configuration', () => {
  let router, app;
  beforeAll(() => {
    router = fs.readFileSync(path.join(PROJECT_ROOT, 'js/router.js'), 'utf8');
    app = fs.readFileSync(path.join(PROJECT_ROOT, 'js/app.js'), 'utf8');
  });

  test('should handle hash-based routing', () => {
    expect(router).toContain('hashchange');
  });

  test('should have route definitions in app.js', () => {
    expect(app).toContain('ai-assistant');
    expect(app).toContain('quiz');
  });
});

describe('Accessibility Compliance', () => {
  let html;
  beforeAll(() => {
    html = fs.readFileSync(path.join(PROJECT_ROOT, 'index.html'), 'utf8');
  });

  test('should have navigation landmark', () => {
    expect(html).toMatch(/<nav/i);
  });

  test('should have main landmark', () => {
    expect(html).toMatch(/<main/i);
  });

  test('should have footer landmark', () => {
    expect(html).toMatch(/<footer/i);
  });

  test('should have skip-to-content link', () => {
    expect(html).toMatch(/skip/i);
  });
});

describe('Module Dependencies', () => {
  test('ai-assistant.js should import from utils.js', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'js/ai-assistant.js'), 'utf8');
    expect(content).toContain("from './utils.js'");
  });

  test('auth.js should import sanitize from utils.js', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'js/auth.js'), 'utf8');
    expect(content).toContain('sanitize');
    expect(content).toContain("from './utils.js'");
  });

  test('firebase-config.js should use Firebase v10+ SDK', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'js/firebase-config.js'), 'utf8');
    expect(content).toMatch(/firebase(js|\/10)/);
  });
});
