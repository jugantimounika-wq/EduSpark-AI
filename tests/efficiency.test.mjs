import test from 'node:test';
import assert from 'node:assert/strict';

function debounce(func, wait) {
  let timeout = null;
  return function (...args) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

test('Efficiency: debounce coalesces multiple rapid invocations into single execution', async () => {
  let callCount = 0;
  const debounced = debounce(() => {
    callCount++;
  }, 50);

  debounced();
  debounced();
  debounced();

  assert.equal(callCount, 0, 'Should not fire immediately');

  await new Promise(r => setTimeout(r, 80));
  assert.equal(callCount, 1, 'Should execute exactly once after timeout');
});

test('Efficiency: memoize caches repeated function evaluations', () => {
  let executions = 0;
  const expensiveCalc = memoize((a, b) => {
    executions++;
    return a + b;
  });

  const res1 = expensiveCalc(10, 20);
  const res2 = expensiveCalc(10, 20);
  const res3 = expensiveCalc(10, 20);

  assert.equal(res1, 30);
  assert.equal(res2, 30);
  assert.equal(res3, 30);
  assert.equal(executions, 1, 'Calculation should run only once for identical inputs');
});
