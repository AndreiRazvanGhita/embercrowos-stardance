import { test } from 'node:test';
import assert from 'node:assert';
import { BOOT_LINES, SPLASH_TITLE, JITTER_DELAYS } from '../js/boot.js';

test('BOOT_LINES is a non-empty array of {text, tag} entries', () => {
  assert.ok(Array.isArray(BOOT_LINES));
  assert.ok(BOOT_LINES.length > 0);
  for (const line of BOOT_LINES) {
    assert.equal(typeof line.text, 'string');
    assert.equal(typeof line.tag, 'string');
  }
});

test('BOOT_LINES includes at least one OK and one WARN tag', () => {
  const tags = BOOT_LINES.map((line) => line.tag);
  assert.ok(tags.includes('OK'));
  assert.ok(tags.includes('WARN'));
});

test('SPLASH_TITLE is the EMBERCROW OS title string', () => {
  assert.equal(SPLASH_TITLE, 'EMBERCROW OS');
});

test('JITTER_DELAYS is a non-empty array of positive millisecond offsets', () => {
  assert.ok(Array.isArray(JITTER_DELAYS));
  assert.ok(JITTER_DELAYS.length > 0);
  assert.ok(JITTER_DELAYS.every((d) => typeof d === 'number' && d > 0));
});
