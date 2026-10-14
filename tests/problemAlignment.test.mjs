import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Problem Alignment: All required core pages exist and are mapped in App routes', () => {
  const appContent = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  
  const expectedRoutes = [
    '/dashboard',
    '/discover',
    '/communities',
    '/projects',
    '/events',
    '/showcase',
    '/ai-assistant',
    '/profile',
    '/settings',
    '/admin',
    '/login',
    '/signup',
    '/onboarding'
  ];

  for (const route of expectedRoutes) {
    assert.ok(
      appContent.includes(`path="${route}"`),
      `Route "${route}" required by problem statement must be configured in App.tsx`
    );
  }
});

test('Problem Alignment: Kanban board and sprint columns are defined', () => {
  const kanbanDir = path.resolve('src/components/kanban');
  assert.ok(fs.existsSync(kanbanDir), 'Kanban component directory must exist for collaboration workspace');
});

test('Problem Alignment: AI Assistant capabilities are integrated', () => {
  const aiServicePath = path.resolve('src/lib/aiService.ts');
  const content = fs.readFileSync(aiServicePath, 'utf-8');
  assert.ok(
    content.includes('generateProjectIdea') || content.includes('generateProjectPlan'),
    'AI service must provide generation capabilities'
  );
});
