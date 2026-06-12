import { test } from 'node:test';
import assert from 'node:assert';
import { MASCOT_SMALL, MASCOT_LARGE } from '../js/mascot.js';

test('MASCOT_SMALL is non-empty multi-line ASCII art', () => {
  assert.ok(MASCOT_SMALL.length > 0);
  assert.ok(MASCOT_SMALL.split('\n').length >= 5);
});

test('MASCOT_LARGE has more lines than MASCOT_SMALL', () => {
  assert.ok(MASCOT_LARGE.split('\n').length > MASCOT_SMALL.split('\n').length);
});

test('MASCOT_LARGE contains the ember eye marker', () => {
  assert.ok(MASCOT_LARGE.includes('o'));
});

test('MASCOT_LARGE uses dense fill characters for the silhouette', () => {
  assert.ok(MASCOT_LARGE.includes('@@@@@@@@@@@@@@@@@@@@'));
});
