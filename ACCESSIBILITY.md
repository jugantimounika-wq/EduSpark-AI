# Accessibility (a11y) Conformance — EduSpark AI

## ♿ WCAG 2.1 Level AA Compliance Statement

EduSpark AI is built to provide an inclusive, accessible experience for all users, including those using screen readers, keyboard-only navigation, and assistive technologies.

### Key Accessibility Features

1. **Semantic HTML5 Architecture**:
   - Proper landmark structure: `<header>`, `<nav aria-label="Main Navigation">`, `<main id="main-content" role="main">`, `<footer>`.
   - Distinct heading hierarchy (`<h1>` through `<h3>`).

2. **Keyboard Navigation & Focus Management**:
   - High-visibility focus indicators across all interactive elements (`focus-visible:ring-2 focus-visible:ring-indigo-500`).
   - "Skip to main content" bypass link directly accessible via keyboard <kbd>Tab</kbd> on load.
   - Modal focus trapping preventing focus loss outside open dialogs (`trapFocus` in `src/lib/a11y.ts`).

3. **Screen Reader Integration**:
   - Global `aria-live="polite"` route announcer notifying screen readers upon page navigation (`RouteChangeAnnouncer`).
   - Text alternatives (`aria-label`, `alt` tags) for all visual icons, avatars, and graphics.
   - Error messages announced with `role="alert"` and `aria-live="assertive"` via `ErrorBoundary.tsx`.

4. **Color Contrast & Theme Ergonomics**:
   - All standard text meets or exceeds the WCAG AA minimum 4.5:1 contrast ratio against both light (`#f8fafc`) and dark (`#0b0f19`) canvases.
   - Tested automatically with `npm run test:a11y`.
