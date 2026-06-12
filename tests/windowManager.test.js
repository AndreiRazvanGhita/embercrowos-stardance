import { test } from 'node:test';
import assert from 'node:assert';
import { clampPosition, getCascadeOffset, WindowManager } from '../js/windowManager.js';

test('clampPosition pulls an off-screen window back into view', () => {
  const result = clampPosition(-500, -100, 300, 200, 1000, 600);
  assert.deepEqual(result, { x: -220, y: 0 });
});

test('clampPosition leaves an on-screen position unchanged', () => {
  const result = clampPosition(100, 100, 300, 200, 1000, 600);
  assert.deepEqual(result, { x: 100, y: 100 });
});

test('getCascadeOffset increases by 30px per window and wraps after 10', () => {
  assert.deepEqual(getCascadeOffset(0), { x: 0, y: 0 });
  assert.deepEqual(getCascadeOffset(3), { x: 90, y: 90 });
  assert.deepEqual(getCascadeOffset(10), { x: 0, y: 0 });
});

test('WindowManager.open cascades positions and assigns increasing zIndex', () => {
  const wm = new WindowManager();
  const w1 = wm.open('terminal', { width: 400, height: 300 });
  const w2 = wm.open('notes', { width: 400, height: 300 });
  assert.equal(w1.x, 60);
  assert.equal(w2.x, 90);
  assert.ok(w2.zIndex > w1.zIndex);
});

test('WindowManager.focus raises a window to the top', () => {
  const wm = new WindowManager();
  const w1 = wm.open('terminal', { width: 400, height: 300 });
  const w2 = wm.open('notes', { width: 400, height: 300 });
  wm.focus(w1.id);
  assert.ok(w1.zIndex > w2.zIndex);
  assert.equal(wm.getTopWindow().id, w1.id);
});

test('WindowManager.close removes the window', () => {
  const wm = new WindowManager();
  const w1 = wm.open('terminal', { width: 400, height: 300 });
  wm.close(w1.id);
  assert.equal(wm.windows.length, 0);
});

test('WindowManager.minimize hides a window from getTopWindow', () => {
  const wm = new WindowManager();
  const w1 = wm.open('terminal', { width: 400, height: 300 });
  wm.minimize(w1.id);
  assert.equal(wm.getTopWindow(), undefined);
});

test('WindowManager.move clamps the new position', () => {
  const wm = new WindowManager();
  const w1 = wm.open('terminal', { width: 400, height: 300 });
  wm.move(w1.id, -9999, -9999, 1000, 600);
  assert.equal(w1.x, -320);
  assert.equal(w1.y, 0);
});
