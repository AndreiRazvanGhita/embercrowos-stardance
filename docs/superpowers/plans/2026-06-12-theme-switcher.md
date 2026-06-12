# Theme Switcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a taskbar button that cycles the desktop through three color
themes (Ember, Phosphor, Cyber) by swapping the `--accent` CSS variable via
a `data-theme` attribute on `<body>`.

**Architecture:** A new pure module `js/themes.js` defines the theme list
and a `getNextTheme` cycling function (unit-tested, no DOM). `index.html`
gets a small taskbar button, `style.css` gets two new `body[data-theme=...]`
override blocks plus the button's style, and `js/main.js` wires the button
click to cycle themes and set `document.body.dataset.theme`.

**Tech Stack:** Vanilla JS (ES modules), CSS custom properties, Node's
built-in test runner (`node --test`).

---

### Task 1: Pure theme module + tests

**Files:**
- Create: `js/themes.js`
- Test: `tests/themes.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/themes.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert';
import { THEMES, getNextTheme } from '../js/themes.js';

test('THEMES contains ember, phosphor, and cyber in order', () => {
  assert.deepEqual(THEMES.map((t) => t.name), ['ember', 'phosphor', 'cyber']);
});

test('getNextTheme cycles ember -> phosphor -> cyber -> ember', () => {
  assert.equal(getNextTheme('ember').name, 'phosphor');
  assert.equal(getNextTheme('phosphor').name, 'cyber');
  assert.equal(getNextTheme('cyber').name, 'ember');
});

test('getNextTheme returns the first theme for an unrecognized name', () => {
  assert.equal(getNextTheme('unknown').name, 'ember');
  assert.equal(getNextTheme(undefined).name, 'ember');
});

test('getNextTheme works with a custom themes array', () => {
  const custom = [{ name: 'a', accent: '#111' }, { name: 'b', accent: '#222' }];
  assert.equal(getNextTheme('a', custom).name, 'b');
  assert.equal(getNextTheme('b', custom).name, 'a');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/themes.js'` (or similar
"module not found" error), since `js/themes.js` doesn't exist yet.

- [ ] **Step 3: Implement `js/themes.js`**

Create `js/themes.js`:

```javascript
export const THEMES = [
  { name: 'ember', accent: '#ff5c2b' },
  { name: 'phosphor', accent: '#33ff66' },
  { name: 'cyber', accent: '#33ccff' },
];

export function getNextTheme(currentName, themes = THEMES) {
  const index = themes.findIndex((theme) => theme.name === currentName);
  if (index === -1) {
    return themes[0];
  }
  return themes[(index + 1) % themes.length];
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — all 4 new tests in `tests/themes.test.js` pass, plus all
existing tests still pass.

- [ ] **Step 5: Commit**

```bash
git add js/themes.js tests/themes.test.js
git commit -m "feat: add theme definitions and cycling logic"
```

---

### Task 2: CSS theme overrides and taskbar button style

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Add theme override blocks**

In `style.css`, immediately after the `:root { ... }` block (after line 8,
which currently ends with `}` following `--taskbar-height: 40px;`), add:

```css
body[data-theme="phosphor"] {
  --accent: #33ff66;
}

body[data-theme="cyber"] {
  --accent: #33ccff;
}
```

- [ ] **Step 2: Add the theme toggle button style**

In `style.css`, immediately after the `#taskbar-brand { ... }` block
(after line 258, which currently ends with `}` following
`font-weight: bold;`), add:

```css
#theme-toggle {
  background: transparent;
  border: 1px solid var(--fg);
  color: var(--fg);
  font-family: var(--font-mono);
  font-size: 13px;
  padding: 2px 8px;
  cursor: pointer;
}

#theme-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}
```

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add CSS theme overrides and theme toggle button style"
```

---

### Task 3: Taskbar button markup

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the button to the taskbar**

In `index.html`, the taskbar currently looks like (lines 20-24):

```html
  <div id="taskbar">
    <div id="taskbar-brand">EMBERCROW OS</div>
    <div id="taskbar-apps"></div>
    <div id="taskbar-clock"></div>
  </div>
```

Change it to:

```html
  <div id="taskbar">
    <div id="taskbar-brand">EMBERCROW OS</div>
    <div id="taskbar-apps"></div>
    <button id="theme-toggle" type="button" title="Switch theme">[*]</button>
    <div id="taskbar-clock"></div>
  </div>
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: add theme toggle button to taskbar"
```

---

### Task 4: Wire up theme cycling in main.js

**Files:**
- Modify: `js/main.js`

- [ ] **Step 1: Import the theme module and add state**

In `js/main.js`, line 5 currently reads:

```javascript
import { splitMascotAtEye, getGlowIntensity, calculateEyeOffset, getNextBlinkDelay, isIdle, pickIdleMessage } from './presence.js';
```

Add a new import line immediately after it:

```javascript
import { THEMES, getNextTheme } from './themes.js';
```

Then, near the top of the file where other module-level state is declared
(lines 15-17 currently read):

```javascript
let presenceLastActivityMs = Date.now();
let presenceIdle = false;
let ambientEl = null;
```

Add a new line after them:

```javascript
let currentThemeName = THEMES[0].name;
```

- [ ] **Step 2: Grab the button element**

Lines 22-23 currently read:

```javascript
const taskbarApps = document.getElementById('taskbar-apps');
const taskbarClock = document.getElementById('taskbar-clock');
```

Add a new line after them:

```javascript
const themeToggle = document.getElementById('theme-toggle');
```

- [ ] **Step 3: Add the cycle function**

Add this new function near the other small helper functions (e.g. directly
above `function updateClock() {` at line 169):

```javascript
function cycleTheme() {
  const next = getNextTheme(currentThemeName);
  currentThemeName = next.name;
  document.body.dataset.theme = next.name;
}
```

- [ ] **Step 4: Wire the click handler in init()**

`init()` currently reads (lines 248-257):

```javascript
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

Add `themeToggle.addEventListener('click', cycleTheme);` as a new line
before the closing `}`:

```javascript
function init() {
  renderDesktopIcons();
  presenceEyeEl = renderDesktopMascot();
  updatePresenceGlow();
  initEyeTracking(presenceEyeEl);
  scheduleBlink(presenceEyeEl);
  startIdleWatch(presenceEyeEl);
  updateClock();
  setInterval(updateClock, 1000);
  themeToggle.addEventListener('click', cycleTheme);
}
```

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: PASS — all tests (including the new `themes.test.js`) pass.
`main.js` isn't directly unit tested, so this confirms nothing else broke.

- [ ] **Step 6: Commit**

```bash
git add js/main.js
git commit -m "feat: wire taskbar button to cycle desktop theme"
```

---

### Task 5: Manual verification

**Files:** none (verification only)

- [ ] **Step 1: Start the dev server**

Run: `python -m http.server 8000`

- [ ] **Step 2: Open the app and skip boot**

Open `http://localhost:8000/` in a browser. Press any key or click to skip
the boot sequence and reach the desktop. Confirm the desktop renders in the
default Ember colors (orange accent, as before).

- [ ] **Step 3: Click the theme toggle button**

Click `[*]` in the taskbar. Confirm:
- Borders, highlights, and text that used the accent color (window title
  bars, focused taskbar entries, terminal cursor) turn green (Phosphor).
- The living mascot's glowing eye also turns green.

- [ ] **Step 4: Click again and verify Cyber**

Click `[*]` again. Confirm the same elements (including the mascot's eye)
turn blue/cyan (Cyber).

- [ ] **Step 5: Click again and verify wraparound to Ember**

Click `[*]` a third time. Confirm everything returns to the original orange
Ember theme.

- [ ] **Step 6: Verify reload resets to Ember**

While in Phosphor or Cyber, reload the page and skip boot again. Confirm
the desktop starts in Ember (no persistence), as specified.

---

### Task 6: Update README features list

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add a feature bullet**

In `README.md`, the Features list currently includes a bullet for the
living mascot. Add a new bullet to that list (anywhere among the existing
feature bullets):

```markdown
- **Theme switcher** - cycle the desktop between Ember, Phosphor, and Cyber
  color themes with the `[*]` taskbar button
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: mention theme switcher in README features"
```
