import { test } from 'node:test';
import assert from 'node:assert';
import { formatUptime } from '../js/apps/about.js';

test('formatUptime formats zero elapsed time', () => {
  assert.equal(formatUptime(1000, 1000), '00:00:00');
});

test('formatUptime formats hours, minutes, and seconds', () => {
  const start = 0;
  const now = (1 * 3600 + 2 * 60 + 3) * 1000;
  assert.equal(formatUptime(start, now), '01:02:03');
});

test('formatUptime never goes negative on clock skew', () => {
  assert.equal(formatUptime(1000, 500), '00:00:00');
});
