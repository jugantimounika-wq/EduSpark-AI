import test from 'node:test';
import assert from 'node:assert/strict';

// Test implementation of Security & Sanitization logic
function escapeHtml(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
    .replace(/javascript:[^"']*/gi, '')
    .trim();
}

function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();
  
  if (lower.startsWith('javascript:') || lower.startsWith('data:text/html') || lower.startsWith('vbscript:')) {
    return '#';
  }

  if (trimmed.startsWith('/') || trimmed.startsWith('#') || /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed)) {
    return trimmed;
  }

  return '#';
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return emailRegex.test(email.trim());
}

test('Security: escapeHtml properly neutralizes raw HTML and XSS strings', () => {
  const malicious = '<script>alert("xss")</script>';
  const escaped = escapeHtml(malicious);
  assert.equal(escaped, '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  assert.ok(!escaped.includes('<script>'));
});

test('Security: sanitizeInput removes dangerous scripts and event listeners', () => {
  const input = '<script>alert(1)</script>Hello world<img src="x" onerror="stealCookies()">';
  const sanitized = sanitizeInput(input);
  assert.ok(!sanitized.includes('<script>'));
  assert.ok(!sanitized.includes('onerror='));
  assert.ok(sanitized.includes('Hello world'));
});

test('Security: sanitizeUrl forbids javascript: and malicious protocols', () => {
  assert.equal(sanitizeUrl('javascript:alert(1)'), '#');
  assert.equal(sanitizeUrl('data:text/html,<script>alert(1)</script>'), '#');
  assert.equal(sanitizeUrl('https://github.com/jugantimounika-wq/EduSpark-AI'), 'https://github.com/jugantimounika-wq/EduSpark-AI');
  assert.equal(sanitizeUrl('/dashboard'), '/dashboard');
});

test('Security: validateEmail validates RFC 5322 formatted emails', () => {
  assert.equal(validateEmail('creator@eduspark.ai'), true);
  assert.equal(validateEmail('invalid-email-string'), false);
  assert.equal(validateEmail('user@domain'), false);
  assert.equal(validateEmail(''), false);
});
