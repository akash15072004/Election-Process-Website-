# 🧪 VoteGuide AI — Testing Documentation

## Testing Strategy

VoteGuide AI employs a **multi-layered testing approach** to ensure code quality, security, and reliability across all platform components.

### Test Architecture

| Layer                 | Scope                                                            | Framework | Files                                   |
| --------------------- | ---------------------------------------------------------------- | --------- | --------------------------------------- |
| **Unit Tests**        | Utility functions, sanitization, error classification            | Jest      | `tests/unit/utils.test.js`              |
| **Security Tests**    | API key protection, CSP headers, XSS prevention, Firestore rules | Jest      | `tests/security/security.test.js`       |
| **Integration Tests** | Project structure, config validation, module dependencies        | Jest      | `tests/integration/integration.test.js` |

---

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Security tests only
npm run test:security

# Integration tests only
npm run test:integration
```

### Run with Coverage Report

```bash
npm test -- --coverage
```

---

## Test Coverage Summary

### Unit Tests (25+ cases)

- ✅ `sanitize()` — XSS prevention for all 5 dangerous HTML characters
- ✅ Edge cases: null, undefined, numbers, empty strings, unicode
- ✅ Nested XSS payload detection
- ✅ Event handler injection prevention
- ✅ API request body validation (structure, types, size limits)
- ✅ API error classification (429, 403, 400, 401, 500+)
- ✅ Key switching logic (only on quota/auth, not on model errors)

### Security Tests (20+ cases)

- ✅ Old leaked API key fully removed from all files
- ✅ API keys obfuscated via `atob()` in frontend
- ✅ No API keys logged to console
- ✅ Firebase security headers present (CSP, HSTS, X-Frame-Options, etc.)
- ✅ CSP restricts `default-src` to `'self'`
- ✅ X-Frame-Options set to `DENY`
- ✅ Firestore rules exist and deny-all by default
- ✅ Firestore rules require authentication for writes
- ✅ Cloud Function restricts CORS origins
- ✅ Cloud Function implements rate limiting
- ✅ Cloud Function validates request body
- ✅ `.gitignore` excludes `.env`, `node_modules`, `.firebase`

### Integration Tests (30+ cases)

- ✅ All required project files exist
- ✅ HTML document structure (DOCTYPE, lang, viewport, title, meta)
- ✅ Firebase configuration validity (hosting, rewrites, functions)
- ✅ CSS design system tokens (colors, typography, spacing, dark theme)
- ✅ Router hash-based navigation setup
- ✅ Accessibility landmarks (nav, main, footer, skip link)
- ✅ Module dependency graph correctness

---

## Security Testing Details

### XSS Prevention

All user-supplied data (display names, emails, URLs) is passed through `sanitize()` before DOM injection. Tests verify:

- Script tags are escaped
- Event handlers are neutralized
- Attribute injection is blocked

### API Key Protection

- Frontend keys are base64-encoded (not plaintext)
- Cloud Function acts as a secure proxy
- No keys appear in console output or rendered DOM

### Content Security Policy

Tests verify the CSP header blocks:

- Inline scripts (except required for SPA)
- Unauthorized frame embedding
- Unauthorized API endpoints

---

## Manual Testing Checklist

### Cross-Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

### Responsive Testing

- [ ] Desktop (1920×1080)
- [ ] Tablet (768×1024)
- [ ] Mobile (375×667)
- [ ] Small mobile (320×568)

### Accessibility Testing

- [ ] Keyboard-only navigation (Tab, Enter, Escape)
- [ ] Screen reader compatibility
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Focus indicators visible
- [ ] ARIA labels on interactive element

### Functional Testing

- [ ] All 8 navigation routes load correctly
- [ ] AI Assistant sends and receives messages
- [ ] Quiz scoring and badge awarding
- [ ] Google Sign-In and Sign-Out flow
- [ ] Theme toggle (light/dark)
- [ ] Mobile drawer open/close
- [ ] EVM demo voting flow
- [ ] Translate widget activation
