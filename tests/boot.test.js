import { test } from 'node:test';
import assert from 'node:assert';
import { BOOT_LINES } from '../js/boot.js';

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
