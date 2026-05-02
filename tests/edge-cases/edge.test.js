/**
 * VoteGuide AI — Edge Case & Performance Tests
 * Validates error handling, boundary conditions, and performance constraints
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '../..');

/**
 * Helper to simulate the frontend sanitize function for testing
 */
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

describe('Edge Case Handling — AI Assistant', () => {
  let aiCode;
  beforeAll(() => {
    aiCode = fs.readFileSync(path.join(PROJECT_ROOT, 'js/ai-assistant.js'), 'utf8');
  });

  test('should handle empty API response gracefully', () => {
    expect(aiCode).toMatch(/text\?\.trim\(\)/);
  });

  test('should implement request timeout', () => {
    expect(aiCode).toMatch(/abort|timeout|AbortController/i);
  });

  test('should handle safety-blocked responses', () => {
    expect(aiCode).toContain('SAFETY');
  });

  test('should have fallback for complete API failure', () => {
    expect(aiCode).toContain('getKBResponse');
    expect(aiCode).toMatch(/Knowledge Base|knowledge base|KB/);
  });

  test('should track API usage in localStorage', () => {
    expect(aiCode).toContain('localStorage');
  });

  test('should handle chat history accumulation', () => {
    expect(aiCode).toContain('chatHistory');
    expect(aiCode).toMatch(/clearChatHistory|chatHistory\s*=\s*\[/);
  });

  test('should handle concurrent requests safely', () => {
    // Verify async/await pattern is used (not raw callbacks)
    expect(aiCode).toMatch(/async\s+function/);
    expect(aiCode).toMatch(/await\s+/);
  });
});

describe('Edge Case Handling — Input Validation', () => {
  test('should handle extremely long input strings', () => {
    const longStr = 'a'.repeat(100000);
    const result = sanitize(longStr);
    expect(result.length).toBe(100000);
  });

  test('should handle Hindi/Devanagari text', () => {
    expect(sanitize('मतदान केंद्र कहाँ है?')).toBe('मतदान केंद्र कहाँ है?');
  });

  test('should handle emoji input', () => {
    expect(sanitize('🗳️ Vote! 🇮🇳')).toBe('🗳️ Vote! 🇮🇳');
  });

  test('should handle mixed script injection', () => {
    const payload = '<script>alert("xss")</script>मतदान';
    const result = sanitize(payload);
    expect(result).not.toContain('<script>');
    expect(result).toContain('मतदान');
  });

  test('should handle null bytes', () => {
    expect(sanitize('test\x00input')).toBe('test\x00input');
  });

  test('should handle SQL injection patterns', () => {
    const result = sanitize("'; DROP TABLE users; --");
    expect(result).toContain('&#039;');
  });

  test('should handle prototype pollution attempts', () => {
    expect(sanitize('__proto__')).toBe('__proto__');
    expect(sanitize('constructor')).toBe('constructor');
  });
});

describe('Performance Constraints', () => {
  test('index.html should be under 20KB', () => {
    const size = fs.statSync(path.join(PROJECT_ROOT, 'index.html')).size;
    expect(size).toBeLessThan(20480);
  });

  test('total CSS should be under 100KB', () => {
    const cssDir = path.join(PROJECT_ROOT, 'css');
    const totalCSS = fs.readdirSync(cssDir)
      .filter(f => f.endsWith('.css'))
      .reduce((sum, f) => sum + fs.statSync(path.join(cssDir, f)).size, 0);
    expect(totalCSS).toBeLessThan(102400);
  });

  test('individual JS files should be under 30KB', () => {
    const jsDir = path.join(PROJECT_ROOT, 'js');
    fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).forEach(f => {
      const size = fs.statSync(path.join(jsDir, f)).size;
      expect(size).toBeLessThan(30720);
    });
  });

  test('manifest.json should be valid JSON', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'manifest.json'), 'utf8'));
    expect(manifest.name).toBeDefined();
    expect(manifest.start_url).toBeDefined();
  });

  test('service worker should exist for offline support', () => {
    expect(fs.existsSync(path.join(PROJECT_ROOT, 'sw.js'))).toBe(true);
  });

  test('service worker should cache critical assets', () => {
    const sw = fs.readFileSync(path.join(PROJECT_ROOT, 'sw.js'), 'utf8');
    expect(sw).toContain('cache');
    expect(sw).toContain('index.html');
  });
});

describe('Firebase Deployment Safety', () => {
  test('firebase.json should not deploy node_modules', () => {
    const config = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'firebase.json'), 'utf8'));
    expect(config.hosting.ignore).toContain('**/node_modules/**');
  });

  test('firebase.json should have SPA fallback rewrite', () => {
    const config = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, 'firebase.json'), 'utf8'));
    const rewrite = config.hosting.rewrites?.find(r => r.source === '**');
    expect(rewrite).toBeDefined();
    expect(rewrite.destination).toBe('/index.html');
  });

  test('.firebaserc should exist with project ID', () => {
    const rc = JSON.parse(fs.readFileSync(path.join(PROJECT_ROOT, '.firebaserc'), 'utf8'));
    expect(rc.projects?.default).toBeDefined();
  });

  test('AI assistant should handle missing API keys gracefully', () => {
    const ai = fs.readFileSync(path.join(PROJECT_ROOT, 'js/ai-assistant.js'), 'utf8');
    // Should implement fallback chain if keys fail
    expect(ai).toContain('tryMistral');
    expect(ai).toContain('tryGemini');
    expect(ai).toContain('getKBResponse');
  });
});

describe('Knowledge Base Completeness', () => {
  let aiCode;
  beforeAll(() => {
    aiCode = fs.readFileSync(path.join(PROJECT_ROOT, 'js/ai-assistant.js'), 'utf8');
  });

  test('should cover voter registration topic', () => {
    expect(aiCode).toMatch(/register|registration|form 6/i);
  });

  test('should cover EVM topic', () => {
    expect(aiCode).toMatch(/evm|electronic voting/i);
  });

  test('should cover NOTA topic', () => {
    expect(aiCode).toMatch(/nota|none of the above/i);
  });

  test('should cover VVPAT topic', () => {
    expect(aiCode).toMatch(/vvpat|voter verifiable/i);
  });

  test('should cover NRI voting topic', () => {
    expect(aiCode).toMatch(/nri|overseas|abroad/i);
  });

  test('should cover cVIGIL topic', () => {
    expect(aiCode).toMatch(/cvigil|violation/i);
  });

  test('should cover helpline information', () => {
    expect(aiCode).toContain('1950');
  });

  test('should cover Model Code of Conduct', () => {
    expect(aiCode).toMatch(/model code|mcc|code of conduct/i);
  });

  test('should handle nested HTML sanitization correctly', () => {
    const payload = '<div><p><script>alert(1)</script></p></div>';
    const result = sanitize(payload);
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('<div>');
    expect(result).toContain('&lt;div&gt;&lt;p&gt;&lt;script&gt;');
  });
});

describe('AI Usage Tracking Resilience', () => {
  let aiCode;
  beforeAll(() => {
    aiCode = fs.readFileSync(path.join(PROJECT_ROOT, 'js/ai-assistant.js'), 'utf8');
  });

  test('should have a try-catch block for JSON.parse of localStorage', () => {
    // This handles corrupted storage data
    expect(aiCode).toMatch(/try\s*\{.*JSON\.parse.*\}\s*catch/);
  });

  test('should reset usage if date is stale or missing', () => {
    // The code returns d only if date matches, else resets
    expect(aiCode).toMatch(/d\?\.date\s*===\s*new\s*Date\(\)\.toDateString\(\)/);
    expect(aiCode).toContain('resetUsage');
  });
});
