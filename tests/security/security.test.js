/**
 * VoteGuide AI — Security Tests
 * Validates security posture: key exposure, headers, input sanitization, file safety
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

describe('API Key Security', () => {
  const frontendFiles = [
    'js/ai-assistant.js',
    'js/app.js',
    'js/firebase-config.js',
    'js/utils.js',
    'js/auth.js',
    'js/pages-features.js',
    'js/pages-home.js',
    'index.html'
  ];

  test('should NOT contain the old leaked API key in any frontend file', () => {
    const leakedKey = 'AIzaSyAIqhb57jdvONiid-f6wObTDQOTKl8-Me4';
    frontendFiles.forEach(file => {
      const filePath = path.join(PROJECT_ROOT, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        expect(content).not.toContain(leakedKey);
      }
    });
  });

  test('should NOT expose raw Gemini API keys in ai-assistant.js', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'js/ai-assistant.js'), 'utf8');
    const rawKeyPattern = /['"]AIzaSy[A-Za-z0-9_-]{33}['"]/;
    expect(content).not.toMatch(rawKeyPattern);
  });

  test('should use atob() obfuscation for API keys in frontend', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'js/ai-assistant.js'), 'utf8');
    expect(content).toContain('atob(');
  });

  test('should NOT log API keys to console', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'js/ai-assistant.js'), 'utf8');
    const dangerousPatterns = [
      /console\.log.*_k/,
      /console\.log.*apiKey/i,
      /console\.log.*currentKey/i,
    ];
    dangerousPatterns.forEach(pattern => {
      expect(content).not.toMatch(pattern);
    });
  });

  test('should implement 3-level fallback: Gemini → Mistral → Knowledge Base', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'js/ai-assistant.js'), 'utf8');
    expect(content).toContain('tryGemini');
    expect(content).toContain('tryMistral');
    expect(content).toContain('getKBResponse');
  });

  test('should obfuscate Mistral API key', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'js/ai-assistant.js'), 'utf8');
    expect(content).not.toMatch(/['"]YkGVkTgOvJz3KkP05oW32Ko7uKcr2q1f['"]/);
    expect(content).toContain('_MISTRAL_KEY');
  });

  test('should have hardcoded knowledge base with election topics', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'js/ai-assistant.js'), 'utf8');
    expect(content).toContain('const KB');
    expect(content).toContain('register');
    expect(content).toContain('evm');
    expect(content).toContain('nota');
    expect(content).toContain('polling booth');
  });
});

describe('Firebase Security Configuration', () => {
  test('firebase.json should contain security headers', () => {
    const config = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'firebase.json'), 'utf8'));
    expect(config.hosting.headers).toBeDefined();
    
    const globalHeaders = config.hosting.headers.find(h => h.source === '**');
    expect(globalHeaders).toBeDefined();
    
    const headerKeys = globalHeaders.headers.map(h => h.key);
    expect(headerKeys).toContain('X-Content-Type-Options');
    expect(headerKeys).toContain('X-Frame-Options');
    expect(headerKeys).toContain('Content-Security-Policy');
    expect(headerKeys).toContain('Strict-Transport-Security');
    expect(headerKeys).toContain('Referrer-Policy');
    expect(headerKeys).toContain('Permissions-Policy');
  });

  test('CSP header should restrict default-src to self', () => {
    const config = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'firebase.json'), 'utf8'));
    const globalHeaders = config.hosting.headers.find(h => h.source === '**');
    const csp = globalHeaders.headers.find(h => h.key === 'Content-Security-Policy');
    expect(csp.value).toContain("default-src 'self'");
  });

  test('X-Frame-Options should be DENY', () => {
    const config = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'firebase.json'), 'utf8'));
    const globalHeaders = config.hosting.headers.find(h => h.source === '**');
    const xfo = globalHeaders.headers.find(h => h.key === 'X-Frame-Options');
    expect(xfo.value).toBe('DENY');
  });

  test('firestore.rules file should exist', () => {
    expect(fs.existsSync(path.join(PROJECT_ROOT, 'firestore.rules'))).toBe(true);
  });

  test('firestore.rules should deny all by default', () => {
    const rules = fs.readFileSync(path.join(PROJECT_ROOT, 'firestore.rules'), 'utf8');
    expect(rules).toContain('allow read, write: if false');
  });

  test('firestore.rules should require auth for writes', () => {
    const rules = fs.readFileSync(path.join(PROJECT_ROOT, 'firestore.rules'), 'utf8');
    expect(rules).toContain('request.auth != null');
  });
});

// Note: Cloud Function tests removed — functions/ folder was not used by the frontend.
// The frontend calls Gemini/Mistral APIs directly via ai-assistant.js with its own
// 3-level fallback architecture. Security patterns documented in TESTING.md.

describe('XSS Prevention', () => {
  test('auth.js should import sanitize function', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'js/auth.js'), 'utf8');
    expect(content).toContain('sanitize');
  });

  test('utils.js should export sanitize function', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'js/utils.js'), 'utf8');
    expect(content).toContain('export function sanitize');
  });

  test('sanitize should escape all 5 dangerous characters', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, 'js/utils.js'), 'utf8');
    expect(content).toContain('&amp;');
    expect(content).toContain('&lt;');
    expect(content).toContain('&gt;');
    expect(content).toContain('&quot;');
    expect(content).toContain('&#039;');
  });
});

describe('.gitignore Security', () => {
  test('.gitignore should exclude .env files', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, '.gitignore'), 'utf8');
    expect(content).toContain('.env');
  });

  test('.gitignore should exclude node_modules', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, '.gitignore'), 'utf8');
    expect(content).toContain('node_modules');
  });

  test('.gitignore should exclude Firebase cache', () => {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, '.gitignore'), 'utf8');
    expect(content).toContain('.firebase');
  });
});
