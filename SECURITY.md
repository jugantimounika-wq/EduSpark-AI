# Security Policy — EduSpark AI

## 🔒 Security Architecture & Guarantees

EduSpark AI employs defense-in-depth principles across client and data tiers:

1. **Content Security Policy (CSP)**:
   - Configured in `index.html` enforcing strict `default-src 'self'`, restricting script execution origins, disallowing arbitrary remote evaluation, and preventing clickjacking attacks via `X-Frame-Options: SAMEORIGIN`.

2. **Input Sanitization & XSS Defense**:
   - All user inputs across discussions, project workspaces, and profiles pass through `sanitizeInput()` and `escapeHtml()` in `src/lib/security.ts`.
   - Event handlers and `javascript:` pseudo-protocols in user-submitted links are filtered out before DOM rendering.

3. **Zero Secret Exposure**:
   - Supabase connection utilizes public anonymous keys paired strictly with PostgreSQL Row-Level Security (RLS).
   - Sensitive environment variables are kept isolated; `.env.example` provides template configurations without production credentials.

4. **Client-Side Abuse Mitigation & Rate Limiting**:
   - `rateLimiter` sliding window prevents rapid scripted hammering of AI prompts, matchmaking algorithms, and search endpoints.

5. **Automated Security Verification**:
   - Continuous test suites (`npm run test:security`) validate input encoding, protocol filtering, and malicious input handling.

## Reporting a Vulnerability

Please report sensitive security vulnerabilities to `security@eduspark.ai` or through GitHub Private Vulnerability Reporting.
