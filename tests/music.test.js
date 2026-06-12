import { test } from 'node:test';
import assert from 'node:assert';
import { createArpeggioSequence } from '../js/apps/music.js';

test('step 0 returns the root frequency', () => {
  const seq = createArpeggioSequence(220, [0, 3, 7, 12]);
  assert.equal(seq[0], 220);
});

test('a +12 semitone step is one octave (double frequency)', () => {
  const seq = createArpeggioSequence(220, [0, 12]);
  assert.ok(Math.abs(seq[1] - 440) < 0.001);
});

test('the sequence length matches the input pattern length', () => {
  const seq = createArpeggioSequence(110, [0, 3, 7, 10, 12]);
  assert.equal(seq.length, 5);
});
