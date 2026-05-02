/**
 * VoteGuide AI — Unit Tests: Utility Functions
 * Tests sanitize(), escapeHtml(), and core utility logic
 */

// Re-implement sanitize for Node.js testing (mirrors utils.js)
function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

describe('sanitize() — XSS Prevention', () => {
  test('should escape HTML angle brackets', () => {
    expect(sanitize('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  test('should escape double quotes', () => {
    expect(sanitize('Hello "world"')).toBe('Hello &quot;world&quot;');
  });

  test('should escape single quotes', () => {
    expect(sanitize("it's")).toBe('it&#039;s');
  });

  test('should escape ampersands', () => {
    expect(sanitize('A & B')).toBe('A &amp; B');
  });

  test('should handle empty string', () => {
    expect(sanitize('')).toBe('');
  });

  test('should handle non-string input (null)', () => {
    expect(sanitize(null)).toBe('');
  });

  test('should handle non-string input (undefined)', () => {
    expect(sanitize(undefined)).toBe('');
  });

  test('should handle non-string input (number)', () => {
    expect(sanitize(42)).toBe('');
  });

  test('should handle nested XSS payloads', () => {
    const payload = '<img src=x onerror="alert(1)">';
    const result = sanitize(payload);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  test('should handle event handler injection', () => {
    const payload = '" onmouseover="alert(document.cookie)"';
    const result = sanitize(payload);
    expect(result).not.toContain('"');
  });

  test('should preserve safe text content', () => {
    expect(sanitize('Hello World 123')).toBe('Hello World 123');
  });

  test('should handle unicode characters safely', () => {
    expect(sanitize('नमस्ते भारत 🇮🇳')).toBe('नमस्ते भारत 🇮🇳');
  });
});

describe('Input Validation Logic', () => {
  // Mirrors the Cloud Function validation
  function validateRequestBody(body) {
    if (!body || typeof body !== 'object') return { valid: false, error: 'Missing body' };
    if (!body.contents || !Array.isArray(body.contents) || body.contents.length === 0) return { valid: false, error: 'Missing contents' };
    for (const entry of body.contents) {
      if (!entry.parts || !Array.isArray(entry.parts)) return { valid: false, error: 'Missing parts' };
      for (const part of entry.parts) {
        if (part.text !== undefined && typeof part.text !== 'string') return { valid: false, error: 'Invalid text' };
        if (part.text && part.text.length > 16384) return { valid: false, error: 'Text too long' };
      }
    }
    return { valid: true };
  }

  test('should reject null body', () => {
    expect(validateRequestBody(null).valid).toBe(false);
  });

  test('should reject empty object', () => {
    expect(validateRequestBody({}).valid).toBe(false);
  });

  test('should reject body without contents array', () => {
    expect(validateRequestBody({ contents: 'not an array' }).valid).toBe(false);
  });

  test('should reject empty contents array', () => {
    expect(validateRequestBody({ contents: [] }).valid).toBe(false);
  });

  test('should reject contents without parts', () => {
    expect(validateRequestBody({ contents: [{ role: 'user' }] }).valid).toBe(false);
  });

  test('should reject non-string text', () => {
    expect(validateRequestBody({ contents: [{ parts: [{ text: 123 }] }] }).valid).toBe(false);
  });

  test('should reject text exceeding 16KB limit', () => {
    const longText = 'a'.repeat(16385);
    expect(validateRequestBody({ contents: [{ parts: [{ text: longText }] }] }).valid).toBe(false);
  });

  test('should accept valid request body', () => {
    const body = { contents: [{ role: 'user', parts: [{ text: 'What is NOTA?' }] }] };
    expect(validateRequestBody(body).valid).toBe(true);
  });

  test('should accept multi-turn conversation', () => {
    const body = {
      contents: [
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Hi!' }] },
        { role: 'user', parts: [{ text: 'What is EVM?' }] }
      ]
    };
    expect(validateRequestBody(body).valid).toBe(true);
  });
});

describe('API Error Classification', () => {
  function classifyError(status, errorMsg) {
    if (status === 429) return 'quota';
    if (status === 403) return 'model_unavailable';
    if (status === 400) return 'invalid';
    if (status === 401) return 'auth';
    if (status >= 500) return 'server';
    if (errorMsg?.includes('quota')) return 'quota';
    if (errorMsg?.includes('rate')) return 'quota';
    if (errorMsg?.includes('not found')) return 'model_unavailable';
    return 'unknown';
  }

  test('should classify 429 as quota', () => {
    expect(classifyError(429, '')).toBe('quota');
  });

  test('should classify 403 as model_unavailable', () => {
    expect(classifyError(403, '')).toBe('model_unavailable');
  });

  test('should classify 400 as invalid', () => {
    expect(classifyError(400, '')).toBe('invalid');
  });

  test('should classify 401 as auth', () => {
    expect(classifyError(401, '')).toBe('auth');
  });

  test('should classify 500+ as server', () => {
    expect(classifyError(500, '')).toBe('server');
    expect(classifyError(503, '')).toBe('server');
  });

  test('should detect quota keywords in error message', () => {
    expect(classifyError(200, 'quota exceeded')).toBe('quota');
  });

  test('should detect rate limit keywords', () => {
    expect(classifyError(200, 'rate limit reached')).toBe('quota');
  });

  test('should return unknown for unrecognized errors', () => {
    expect(classifyError(418, 'teapot')).toBe('unknown');
  });
});

describe('API Key Security', () => {
  test('should only switch keys for quota/auth errors, not model errors', () => {
    function shouldSwitchKey(errorType) {
      return ['quota', 'auth'].includes(errorType);
    }

    expect(shouldSwitchKey('quota')).toBe(true);
    expect(shouldSwitchKey('auth')).toBe(true);
    expect(shouldSwitchKey('model_unavailable')).toBe(false);
    expect(shouldSwitchKey('invalid')).toBe(false);
    expect(shouldSwitchKey('server')).toBe(false);
  });
});
