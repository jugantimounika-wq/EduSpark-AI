import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function calculateLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(rgb1, rgb2) {
  const lum1 = calculateLuminance(...rgb1);
  const lum2 = calculateLuminance(...rgb2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

test('Accessibility: WCAG AA contrast ratio satisfies >= 4.5:1 for standard text', () => {
  // Dark text on white background
  const darkOnWhite = getContrastRatio([15, 23, 42], [255, 255, 255]);
  assert.ok(darkOnWhite >= 4.5, `Contrast ${darkOnWhite} must be >= 4.5`);

  // Light text on dark slate
  const whiteOnDark = getContrastRatio([248, 250, 252], [11, 15, 25]);
  assert.ok(whiteOnDark >= 4.5, `Contrast ${whiteOnDark} must be >= 4.5`);
});

test('Accessibility: index.html contains accessible skip link and ARIA live region', () => {
  const indexPath = path.resolve('index.html');
  const content = fs.readFileSync(indexPath, 'utf-8');
  assert.ok(content.includes('Skip to main content'), 'Must have skip-to-content anchor');
  assert.ok(content.includes('id="a11y-announcer"'), 'Must have global live announcer');
  assert.ok(content.includes('aria-live="polite"'), 'Announcer must have aria-live attribute');
  assert.ok(content.includes('lang="en"'), 'HTML tag must have lang attribute');
});

test('Accessibility: App.tsx wraps view in semantic main landmark with id', () => {
  const appPath = path.resolve('src/App.tsx');
  const content = fs.readFileSync(appPath, 'utf-8');
  assert.ok(content.includes('id="main-content"'), 'Must provide target for skip link');
  assert.ok(content.includes('role="main"'), 'Must specify main landmark role');
});
