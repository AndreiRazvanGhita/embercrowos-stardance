import { test } from 'node:test';
import assert from 'node:assert';
import {
  splitMascotAtEye,
  calculateEyeOffset,
  getGlowIntensity,
  isIdle,
  pickIdleMessage,
  getNextBlinkDelay,
} from '../js/presence.js';
import { MASCOT_LARGE } from '../js/mascot.js';

test('splitMascotAtEye splits MASCOT_LARGE at its eye marker and round-trips', () => {
  const { before, eye, after } = splitMascotAtEye(MASCOT_LARGE);
  assert.equal(eye, 'o');
  assert.equal(before + eye + after, MASCOT_LARGE);
});

test('splitMascotAtEye returns the whole string as "before" when no marker is found', () => {
  const { before, eye, after } = splitMascotAtEye('no marker here', 'z');
  assert.equal(before, 'no marker here');
  assert.equal(eye, '');
  assert.equal(after, '');
});

test('calculateEyeOffset returns zero offset when cursor is at viewport center', () => {
  const offset = calculateEyeOffset(500, 300, 1000, 600, 8);
  assert.deepEqual(offset, { x: 0, y: 0 });
});

test('calculateEyeOffset clamps to maxOffset for cursor positions beyond the viewport', () => {
  const offset = calculateEyeOffset(-500, -300, 1000, 600, 8);
  assert.deepEqual(offset, { x: -8, y: -8 });
});

test('calculateEyeOffset scales proportionally within the viewport', () => {
  const offset = calculateEyeOffset(750, 300, 1000, 600, 8);
  assert.deepEqual(offset, { x: 4, y: 0 });
});

test('calculateEyeOffset returns zero offset (no NaN) when viewport dimensions are zero', () => {
  const offset = calculateEyeOffset(100, 100, 0, 0, 8);
  assert.deepEqual(offset, { x: 0, y: 0 });
});

test('getGlowIntensity increases with open window count and caps at max', () => {
  assert.equal(getGlowIntensity(0), 0.4);
  assert.equal(getGlowIntensity(5), 1.0);
  assert.equal(getGlowIntensity(10), 1.0);
});

test('isIdle is false just under the threshold and true at/over it', () => {
  assert.equal(isIdle(0, 29999, 30000), false);
  assert.equal(isIdle(0, 30000, 30000), true);
});

test('pickIdleMessage picks based on the provided random function', () => {
  const messages = ['a', 'b', 'c'];
  assert.equal(pickIdleMessage(messages, () => 0), 'a');
  assert.equal(pickIdleMessage(messages, () => 0.99), 'c');
});

test('getNextBlinkDelay returns a value within the given range', () => {
  assert.equal(getNextBlinkDelay(() => 0, 4000, 9000), 4000);
  assert.equal(getNextBlinkDelay(() => 1, 4000, 9000), 9000);
});
