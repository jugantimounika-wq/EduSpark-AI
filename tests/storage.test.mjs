import test from 'node:test';
import assert from 'node:assert/strict';

test('Storage & Resilience: LocalStorage state fallback handles missing or corrupt data', () => {
  const safeParse = (data, fallback) => {
    if (data === null || data === undefined) return fallback;
    try {
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  };

  assert.deepEqual(safeParse('{"key":"value"}', {}), { key: 'value' });
  assert.deepEqual(safeParse('invalid-json{', { default: true }), { default: true });
  assert.deepEqual(safeParse(null, []), []);
});
