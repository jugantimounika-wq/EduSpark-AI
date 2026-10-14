/**
 * Security & Data Sanitization Utilities
 * Protects application against XSS, injection, token leakage, and malicious payload abuse.
 */

/**
 * Escapes unsafe HTML characters to prevent XSS injection in raw HTML rendering.
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips script tags, unsafe protocols, and event handlers from user text.
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^"']*/gi, '')
    .trim();
}

/**
 * Validates URLs ensuring only safe protocols (http, https, mailto) are followed.
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  
  if (lower.startsWith('javascript:') || lower.startsWith('data:text/html') || lower.startsWith('vbscript:')) {
    console.warn('[Security Warning]: Blocked unsafe URI scheme:', trimmed);
    return '#';
  }

  // Accept valid relative and absolute web URLs
  if (trimmed.startsWith('/') || trimmed.startsWith('#') || /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }

  return '#';
}

/**
 * Validates email addresses against standard RFC 5322 format.
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

/**
 * Calculates password strength score (0-4) with clear feedback.
 */
export function evaluatePasswordStrength(password: string): {
  score: number;
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (!password) {
    return { score: 0, label: 'Very Weak', feedback: ['Password is required.'] };
  }

  if (password.length >= 8) score++;
  else feedback.push('Use at least 8 characters.');

  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  else feedback.push('Include both uppercase and lowercase letters.');

  if (/\d/.test(password)) score++;
  else feedback.push('Include at least one numerical digit.');

  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
  else feedback.push('Include at least one special symbol.');

  const labels: ('Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong')[] = [
    'Very Weak',
    'Weak',
    'Medium',
    'Strong',
    'Very Strong'
  ];

  return {
    score,
    label: labels[score] || 'Medium',
    feedback,
  };
}

/**
 * Sliding window client-side rate limiter for AI queries and API operations.
 */
class ClientRateLimiter {
  private requests: Map<string, number[]> = new Map();

  public isAllowed(actionKey: string, maxCalls: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(actionKey) || [];
    
    // Purge expired timestamps outside the sliding window
    const validTimestamps = timestamps.filter(t => now - t < windowMs);
    
    if (validTimestamps.length >= maxCalls) {
      this.requests.set(actionKey, validTimestamps);
      return false;
    }

    validTimestamps.push(now);
    this.requests.set(actionKey, validTimestamps);
    return true;
  }

  public getRemainingCooldown(actionKey: string, windowMs: number = 60000): number {
    const timestamps = this.requests.get(actionKey) || [];
    if (timestamps.length === 0) return 0;
    const oldest = timestamps[0];
    const diff = windowMs - (Date.now() - oldest);
    return Math.max(0, Math.ceil(diff / 1000));
  }

  public reset(actionKey?: string): void {
    if (actionKey) {
      this.requests.delete(actionKey);
    } else {
      this.requests.clear();
    }
  }
}

export const rateLimiter = new ClientRateLimiter();

/**
 * Masks sensitive secrets or tokens to prevent accidental log exposure.
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return '';
  if (secret.length <= 8) return '********';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}
