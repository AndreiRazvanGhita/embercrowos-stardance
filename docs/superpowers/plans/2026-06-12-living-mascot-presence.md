# Living Mascot Presence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the EMBERCROW OS desktop watermark mascot "alive" — its ember eye tracks the cursor, blinks, narrows and whispers cryptic messages when idle, and glows brighter as more windows are opened.

**Architecture:** A pure-logic module `js/presence.js` (split-string, offset/intensity math, idle/timing helpers) is unit tested with Node's built-in test runner, exactly like `js/windowManager.js` and `js/mascot.js`. `js/main.js` renders the mascot watermark (splitting `MASCOT_LARGE` so its eye character becomes an independently-styled `<span>`), and wires DOM listeners (mousemove/keydown/click, intervals, timeouts) that call into the pure functions to drive CSS classes and a `--presence-intensity` custom property.

**Tech Stack:** Vanilla HTML5, CSS3, ES2022 JavaScript (native modules). Node.js v18+ (`node --test`) for the test suite only.

**Prerequisite:** This plan assumes `docs/superpowers/plans/2026-06-12-embercrow-os.md` has been implemented — specifically `js/mascot.js` (exports `MASCOT_LARGE`), `js/windowManager.js` (`WindowManager`), `index.html`, `style.css`, and `js/main.js` (with `wm`, `openApp`, `closeWindow`, `init`, etc.) as described in that plan.

---

## Task 1: Pure Presence Logic Module

**Files:**
- Create: `js/presence.js`
- Test: `tests/presence.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/presence.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/presence.test.js`
Expected: FAIL — `Cannot find module '../js/presence.js'`

- [ ] **Step 3: Create `js/presence.js`**

```js
export function splitMascotAtEye(mascotArt, marker = 'o') {
  const index = mascotArt.indexOf(marker);
  if (index === -1) {
    return { before: mascotArt, eye: '', after: '' };
  }
  return {
    before: mascotArt.slice(0, index),
    eye: mascotArt[index],
    after: mascotArt.slice(index + 1),
  };
}

export function calculateEyeOffset(cursorX, cursorY, viewportWidth, viewportHeight, maxOffset) {
  const centerX = viewportWidth / 2;
  const centerY = viewportHeight / 2;
  const ratioX = (cursorX - centerX) / centerX;
  const ratioY = (cursorY - centerY) / centerY;
  const clamp = (value) => Math.min(1, Math.max(-1, value));
  return {
    x: clamp(ratioX) * maxOffset,
    y: clamp(ratioY) * maxOffset,
  };
}

export function getGlowIntensity(openWindowCount, { base = 0.4, step = 0.12, max = 1.0 } = {}) {
  return Math.min(max, base + openWindowCount * step);
}

export function isIdle(lastActivityMs, nowMs, idleThresholdMs) {
  return nowMs - lastActivityMs >= idleThresholdMs;
}

export function pickIdleMessage(messages, randomFn = Math.random) {
  const index = Math.floor(randomFn() * messages.length);
  return messages[Math.min(index, messages.length - 1)];
}

export function getNextBlinkDelay(randomFn = Math.random, minMs = 4000, maxMs = 9000) {
  return minMs + randomFn() * (maxMs - minMs);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/presence.test.js`
Expected: PASS — `# pass 9`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/presence.js tests/presence.test.js
git commit -m "feat: add pure presence logic module for living mascot"
```

---

## Task 2: Render the Desktop Mascot Watermark with a Glowing Eye

**Files:**
- Modify: `index.html`
- Modify: `js/main.js`
- Modify: `style.css`

- [ ] **Step 1: Add the watermark element to `index.html`**

Find:

```html
  <div id="desktop">
    <div id="desktop-icons"></div>
    <div id="windows-container"></div>
  </div>
```

Replace with:

```html
  <div id="desktop">
    <pre id="desktop-mascot" class="desktop-mascot" aria-hidden="true"></pre>
    <div id="desktop-icons"></div>
    <div id="windows-container"></div>
  </div>
```

- [ ] **Step 2: Import presence helpers and the large mascot in `js/main.js`**

Find:

```js
import { WindowManager } from './windowManager.js';
import { apps, getApp } from './apps.js';
import { playBoot } from './boot.js';
```

Replace with:

```js
import { WindowManager } from './windowManager.js';
import { apps, getApp } from './apps.js';
import { playBoot } from './boot.js';
import { MASCOT_LARGE } from './mascot.js';
import { splitMascotAtEye, getGlowIntensity } from './presence.js';
```

- [ ] **Step 3: Add `renderDesktopMascot` and `updatePresenceGlow`, and wire them into `init`**

Find:

```js
function init() {
  renderDesktopIcons();
  updateClock();
  setInterval(updateClock, 1000);
}
```

Replace with:

```js
let presenceEyeEl = null;

function renderDesktopMascot() {
  const mascotEl = document.getElementById('desktop-mascot');
  const { before, eye, after } = splitMascotAtEye(MASCOT_LARGE);
  mascotEl.textContent = '';
  mascotEl.append(document.createTextNode(before));
  const eyeEl = document.createElement('span');
  eyeEl.className = 'embercrow-eye';
  eyeEl.textContent = eye;
  mascotEl.append(eyeEl);
  mascotEl.append(document.createTextNode(after));
  return eyeEl;
}

function updatePresenceGlow() {
  if (!presenceEyeEl) return;
  const intensity = getGlowIntensity(wm.windows.length);
  presenceEyeEl.style.setProperty('--presence-intensity', String(intensity));
}

function init() {
  renderDesktopIcons();
  presenceEyeEl = renderDesktopMascot();
  updatePresenceGlow();
  updateClock();
  setInterval(updateClock, 1000);
}
```

- [ ] **Step 4: Append watermark and eye styles to `style.css`**

```css
/* Living Mascot Presence */
.desktop-mascot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  color: rgba(224, 224, 224, 0.06);
  font-size: 16px;
  line-height: 1.2;
  pointer-events: none;
  user-select: none;
}

.embercrow-eye {
  display: inline-block;
  color: var(--accent);
  text-shadow: 0 0 calc(6px * var(--presence-intensity, 0.4)) var(--accent);
}
```

Note: the watermark uses a low-alpha `rgba()` color rather than the CSS `opacity` property. `opacity` on `.desktop-mascot` would also dim its descendants (including the eye span), making it impossible for the eye to glow brighter than the rest of the mascot.

- [ ] **Step 5: Manual verification**

Run: `python -m http.server 8000` from `R:\stardance-webos`, open `http://localhost:8000/`, skip boot.

Expected: a faint EMBERCROW silhouette is centered on the desktop behind the icons, with one character glowing in ember orange (the eye). No console errors.

- [ ] **Step 6: Commit**

```bash
git add index.html js/main.js style.css
git commit -m "feat: render living mascot watermark with glowing eye"
```

---

## Task 3: Eye-Tracking Parallax

**Files:**
- Modify: `js/main.js`
- Modify: `style.css`

- [ ] **Step 1: Import `calculateEyeOffset` and add `initEyeTracking`**

Find:

```js
import { splitMascotAtEye, getGlowIntensity } from './presence.js';
```

Replace with:

```js
import { splitMascotAtEye, getGlowIntensity, calculateEyeOffset } from './presence.js';

const PRESENCE_MAX_OFFSET = 8;
```

- [ ] **Step 2: Add `initEyeTracking` and call it from `init`**

Find:

```js
function init() {
  renderDesktopIcons();
  presenceEyeEl = renderDesktopMascot();
  updatePresenceGlow();
  updateClock();
  setInterval(updateClock, 1000);
}
```

Replace with:

```js
function initEyeTracking(eyeEl) {
  document.addEventListener('mousemove', (e) => {
    const offset = calculateEyeOffset(e.clientX, e.clientY, window.innerWidth, window.innerHeight, PRESENCE_MAX_OFFSET);
    eyeEl.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
  });
}

function init() {
  renderDesktopIcons();
  presenceEyeEl = renderDesktopMascot();
  updatePresenceGlow();
  initEyeTracking(presenceEyeEl);
  updateClock();
  setInterval(updateClock, 1000);
}
```

- [ ] **Step 3: Add a transform transition to `.embercrow-eye`**

Find:

```css
.embercrow-eye {
  display: inline-block;
  color: var(--accent);
  text-shadow: 0 0 calc(6px * var(--presence-intensity, 0.4)) var(--accent);
}
```

Replace with:

```css
.embercrow-eye {
  display: inline-block;
  color: var(--accent);
  text-shadow: 0 0 calc(6px * var(--presence-intensity, 0.4)) var(--accent);
  transition: transform 0.4s ease-out;
}
```

- [ ] **Step 4: Manual verification**

Reload `http://localhost:8000/`, skip boot, move the mouse slowly around the whole screen.

Expected: the ember eye shifts a few pixels toward the cursor with a smooth easing motion — never moving more than ~8px from its resting position.

- [ ] **Step 5: Commit**

```bash
git add js/main.js style.css
git commit -m "feat: add cursor-tracking parallax to living mascot eye"
```

---

## Task 4: Blinking

**Files:**
- Modify: `js/main.js`
- Modify: `style.css`

- [ ] **Step 1: Import `getNextBlinkDelay` and add `scheduleBlink`**

Find:

```js
import { splitMascotAtEye, getGlowIntensity, calculateEyeOffset } from './presence.js';
```

Replace with:

```js
import { splitMascotAtEye, getGlowIntensity, calculateEyeOffset, getNextBlinkDelay } from './presence.js';
```

- [ ] **Step 2: Add `scheduleBlink` and call it from `init`**

Find:

```js
function init() {
  renderDesktopIcons();
  presenceEyeEl = renderDesktopMascot();
  updatePresenceGlow();
  initEyeTracking(presenceEyeEl);
  updateClock();
  setInterval(updateClock, 1000);
}
```

Replace with:

```js
function scheduleBlink(eyeEl) {
  setTimeout(() => {
    eyeEl.classList.add('blinking');
    setTimeout(() => eyeEl.classList.remove('blinking'), 150);
    scheduleBlink(eyeEl);
  }, getNextBlinkDelay());
}

function init() {
  renderDesktopIcons();
  presenceEyeEl = renderDesktopMascot();
  updatePresenceGlow();
  initEyeTracking(presenceEyeEl);
  scheduleBlink(presenceEyeEl);
  updateClock();
  setInterval(updateClock, 1000);
}
```

- [ ] **Step 3: Append the blink animation to `style.css`**

```css
@keyframes embercrow-blink {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.1); }
}

.embercrow-eye.blinking {
  animation: embercrow-blink 0.15s ease-in-out;
}
```

- [ ] **Step 4: Manual verification**

Reload `http://localhost:8000/`, skip boot, watch the eye for 10-15 seconds without touching the mouse.

Expected: the eye blinks (quickly flattens and restores) roughly every 4-9 seconds, at irregular intervals.

- [ ] **Step 5: Commit**

```bash
git add js/main.js style.css
git commit -m "feat: add random blinking to living mascot eye"
```

---

## Task 5: Idle Squint and Ambient Message

**Files:**
- Modify: `js/main.js`
- Modify: `style.css`

- [ ] **Step 1: Import `isIdle` and `pickIdleMessage`, add idle constants and state**

Find:

```js
import { splitMascotAtEye, getGlowIntensity, calculateEyeOffset, getNextBlinkDelay } from './presence.js';

const PRESENCE_MAX_OFFSET = 8;
```

Replace with:

```js
import { splitMascotAtEye, getGlowIntensity, calculateEyeOffset, getNextBlinkDelay, isIdle, pickIdleMessage } from './presence.js';

const PRESENCE_MAX_OFFSET = 8;
const PRESENCE_IDLE_THRESHOLD_MS = 30000;
const PRESENCE_IDLE_MESSAGES = [
  '...still there?',
  'signal idle.',
  'the embercrow waits.',
];

let presenceLastActivityMs = Date.now();
let presenceIdle = false;
let ambientEl = null;
```

- [ ] **Step 2: Add `registerPresenceActivity` and update `initEyeTracking` to track activity**

Find:

```js
function initEyeTracking(eyeEl) {
  document.addEventListener('mousemove', (e) => {
    const offset = calculateEyeOffset(e.clientX, e.clientY, window.innerWidth, window.innerHeight, PRESENCE_MAX_OFFSET);
    eyeEl.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
  });
}
```

Replace with:

```js
function registerPresenceActivity() {
  presenceLastActivityMs = Date.now();
  if (presenceIdle) {
    presenceIdle = false;
    presenceEyeEl.classList.remove('idle');
    ambientEl.classList.remove('visible');
  }
}

function initEyeTracking(eyeEl) {
  document.addEventListener('mousemove', (e) => {
    registerPresenceActivity();
    const offset = calculateEyeOffset(e.clientX, e.clientY, window.innerWidth, window.innerHeight, PRESENCE_MAX_OFFSET);
    eyeEl.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
  });
  document.addEventListener('keydown', registerPresenceActivity);
  document.addEventListener('click', registerPresenceActivity);
}
```

- [ ] **Step 3: Make `scheduleBlink` skip blinking while idle**

Find:

```js
function scheduleBlink(eyeEl) {
  setTimeout(() => {
    eyeEl.classList.add('blinking');
    setTimeout(() => eyeEl.classList.remove('blinking'), 150);
    scheduleBlink(eyeEl);
  }, getNextBlinkDelay());
}
```

Replace with:

```js
function scheduleBlink(eyeEl) {
  setTimeout(() => {
    if (!presenceIdle) {
      eyeEl.classList.add('blinking');
      setTimeout(() => eyeEl.classList.remove('blinking'), 150);
    }
    scheduleBlink(eyeEl);
  }, getNextBlinkDelay());
}
```

- [ ] **Step 4: Add `positionAmbientMessage`, `startIdleWatch`, and call it from `init`**

Find:

```js
function init() {
  renderDesktopIcons();
  presenceEyeEl = renderDesktopMascot();
  updatePresenceGlow();
  initEyeTracking(presenceEyeEl);
  scheduleBlink(presenceEyeEl);
  updateClock();
  setInterval(updateClock, 1000);
}
```

Replace with:

```js
function positionAmbientMessage(eyeEl) {
  const eyeRect = eyeEl.getBoundingClientRect();
  const desktopRect = document.getElementById('desktop').getBoundingClientRect();
  ambientEl.style.left = `${eyeRect.right - desktopRect.left + 8}px`;
  ambientEl.style.top = `${eyeRect.top - desktopRect.top}px`;
}

function startIdleWatch(eyeEl) {
  ambientEl = document.createElement('div');
  ambientEl.className = 'embercrow-ambient-message';
  document.getElementById('desktop').appendChild(ambientEl);

  setInterval(() => {
    if (!presenceIdle && isIdle(presenceLastActivityMs, Date.now(), PRESENCE_IDLE_THRESHOLD_MS)) {
      presenceIdle = true;
      eyeEl.classList.add('idle');
      ambientEl.textContent = pickIdleMessage(PRESENCE_IDLE_MESSAGES);
      positionAmbientMessage(eyeEl);
      ambientEl.classList.add('visible');
    }
  }, 1000);
}

function init() {
  renderDesktopIcons();
  presenceEyeEl = renderDesktopMascot();
  updatePresenceGlow();
  initEyeTracking(presenceEyeEl);
  scheduleBlink(presenceEyeEl);
  startIdleWatch(presenceEyeEl);
  updateClock();
  setInterval(updateClock, 1000);
}
```

- [ ] **Step 5: Append idle and ambient message styles to `style.css`**

```css
.embercrow-eye.idle {
  transform: scaleY(0.3) !important;
  opacity: 0.5;
  transition: transform 1.2s ease, opacity 1.2s ease;
}

.embercrow-ambient-message {
  position: absolute;
  white-space: nowrap;
  color: var(--fg);
  opacity: 0;
  font-size: 12px;
  transition: opacity 1.2s ease;
  pointer-events: none;
}

.embercrow-ambient-message.visible {
  opacity: 0.4;
}
```

- [ ] **Step 6: Manual verification**

Reload `http://localhost:8000/`, skip boot, then leave the mouse and keyboard untouched for at least 30 seconds.

Expected: the eye narrows and dims, and a short cryptic message (e.g. "...still there?") fades in just to its right. Moving the mouse or pressing any key immediately restores the eye and fades the message out. Repeat once to confirm a (possibly different) message appears again after another 30s idle period.

- [ ] **Step 7: Commit**

```bash
git add js/main.js style.css
git commit -m "feat: add idle squint and ambient messages to living mascot"
```

---

## Task 6: Reactive Glow on Open Window Count

**Files:**
- Modify: `js/main.js`
- Modify: `style.css`

- [ ] **Step 1: Call `updatePresenceGlow` when a window opens**

Find (end of `openApp`):

```js
  taskbarApps.appendChild(taskbarEntry);
  taskbarEls.set(win.id, taskbarEntry);

  focusWindow(win.id);
}
```

Replace with:

```js
  taskbarApps.appendChild(taskbarEntry);
  taskbarEls.set(win.id, taskbarEntry);

  focusWindow(win.id);
  updatePresenceGlow();
}
```

- [ ] **Step 2: Call `updatePresenceGlow` when a window closes**

Find:

```js
function closeWindow(id) {
  wm.close(id);
  windowEls.get(id)?.remove();
  windowEls.delete(id);
  taskbarEls.get(id)?.remove();
  taskbarEls.delete(id);
  updateFocusStyles();
}
```

Replace with:

```js
function closeWindow(id) {
  wm.close(id);
  windowEls.get(id)?.remove();
  windowEls.delete(id);
  taskbarEls.get(id)?.remove();
  taskbarEls.delete(id);
  updateFocusStyles();
  updatePresenceGlow();
}
```

- [ ] **Step 3: Make the glow transition smoothly in `style.css`**

Find:

```css
.embercrow-eye {
  display: inline-block;
  color: var(--accent);
  text-shadow: 0 0 calc(6px * var(--presence-intensity, 0.4)) var(--accent);
  transition: transform 0.4s ease-out;
}
```

Replace with:

```css
.embercrow-eye {
  display: inline-block;
  color: var(--accent);
  text-shadow: 0 0 calc(6px * var(--presence-intensity, 0.4)) var(--accent);
  transition: transform 0.4s ease-out, text-shadow 0.6s ease;
}
```

- [ ] **Step 4: Manual verification**

Reload `http://localhost:8000/`, skip boot. Double-click desktop icons to open Terminal, File Explorer, About, Notes, and Music one at a time, watching the eye after each.

Expected: the eye's ember glow visibly brightens with each window opened (capping out around 5 windows). Close windows one by one via `[x]` — the glow dims back down step by step toward its baseline.

- [ ] **Step 5: Commit**

```bash
git add js/main.js style.css
git commit -m "feat: tie living mascot glow intensity to open window count"
```

---

## Task 7: Final Integration and Walkthrough

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Run the full test suite**

Run: `node --test tests/`
Expected: PASS — all suites green, including `# pass 9` for `tests/presence.test.js` (40 total passing tests across the project: 31 from the base EMBERCROW OS plan + 9 from presence).

- [ ] **Step 2: Add an "Ambient Features" section to `README.md`**

Find:

```markdown
## Controls

- Drag a window by its title bar
- `[_]` minimizes to the taskbar, `[x]` closes
- Click a window or its taskbar entry to focus it
- Press any key or click during boot to skip the intro
```

Replace with:

```markdown
## Controls

- Drag a window by its title bar
- `[_]` minimizes to the taskbar, `[x]` closes
- Click a window or its taskbar entry to focus it
- Press any key or click during boot to skip the intro

## Ambient Features

- **Living mascot** - the desktop watermark's ember eye tracks your cursor,
  blinks at random, and glows brighter the more windows you have open
- **Idle presence** - leave the desktop untouched for ~30 seconds and the
  eye narrows while a cryptic message appears beside it; any input clears it
```

- [ ] **Step 3: Full manual walkthrough**

Run: `python -m http.server 8000`, open `http://localhost:8000/`.

Walk through and confirm:
- The faint EMBERCROW watermark with a glowing ember eye is visible behind desktop icons after boot.
- The eye tracks the cursor with a small, smooth parallax offset.
- The eye blinks at irregular ~4-9 second intervals.
- After ~30 seconds idle, the eye narrows/dims and an ambient message appears beside it; any input clears this instantly.
- Opening windows brightens the eye's glow; closing them dims it back down.
- All previously-verified behaviors (boot sequence, window drag/focus/minimize/close, all 5 apps) still work with no console errors.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: document living mascot ambient features"
```
