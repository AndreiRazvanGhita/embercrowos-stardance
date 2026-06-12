# EMBERCROW OS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build EMBERCROW OS, a static (no build step) hacker-themed black & white web desktop with draggable/focusable/minimizable windows, five apps (Terminal, File Explorer, About, Notes, Music), a skippable boot/login sequence, and an ASCII bird mascot with an ember-orange accent.

**Architecture:** Plain HTML/CSS/JS using native ES modules (`<script type="module">`, no bundler). A pure-logic `WindowManager` class (no DOM) tracks window position/z-index/focus state and is unit tested with Node's built-in test runner; `main.js` renders that state to the DOM and wires up drag/focus/minimize/close. Each app is a self-contained module exporting `{ id, title, icon, defaultSize, createContent(container) }`, registered in `js/apps.js`. Pure data/logic (command parsing, file tree lookup, uptime formatting, notes storage, arpeggio sequencing, boot script data) is extracted into testable functions; DOM/animation/audio code is verified manually in the browser.

**Tech Stack:** Vanilla HTML5, CSS3, ES2022 JavaScript (native modules). Node.js v18+ (`node --test`) for the test suite only — the site itself ships as static files with no dependencies.

---

## Prerequisites

- Node.js v18+ installed (confirmed: v22.20.0) — used only to run `node --test tests/`.
- A way to serve static files for browser verification, e.g. `python -m http.server 8000` run from the project root, then open `http://localhost:8000/` in a browser. (Opening `index.html` directly via `file://` also works for everything except nothing here needs a server, but using a server avoids any module CORS quirks.)

---

## Task 1: Project Scaffold & Base Theme

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `style.css`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "embercrow-os",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/"
  }
}
```

- [ ] **Step 2: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EMBERCROW OS</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div id="boot-screen"></div>

  <div id="desktop">
    <pre id="desktop-bg-mascot"></pre>
    <div id="desktop-icons"></div>
    <div id="windows-container"></div>
  </div>

  <div id="taskbar">
    <div id="taskbar-brand">EMBERCROW OS</div>
    <div id="taskbar-apps"></div>
    <div id="taskbar-clock"></div>
  </div>

  <div class="scanline-overlay"></div>

  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create `style.css`**

```css
:root {
  --bg: #0a0a0a;
  --fg: #e0e0e0;
  --accent: #ff5c2b;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  --font-display: 'Orbitron', sans-serif;
  --taskbar-height: 40px;
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-mono);
  overflow: hidden;
}

/* Boot screen */
#boot-screen {
  position: fixed;
  inset: 0;
  background: var(--bg);
  color: var(--fg);
  z-index: 1000;
  padding: 24px;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  transition: opacity 0.4s ease;
}

#boot-screen.boot-collapse {
  opacity: 0;
}

.boot-tag {
  color: var(--accent);
}

.boot-mascot {
  color: var(--accent);
  margin-top: 16px;
  white-space: pre;
}

.boot-prompt {
  margin-top: 16px;
}

/* Desktop */
#desktop {
  position: relative;
  width: 100%;
  height: calc(100% - var(--taskbar-height));
  overflow: hidden;
}

#desktop-bg-mascot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  color: var(--fg);
  opacity: 0.06;
  font-size: 8px;
  line-height: 1.1;
  white-space: pre;
  pointer-events: none;
  z-index: 0;
  user-select: none;
}

#desktop-icons {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 1;
}

.desktop-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 72px;
  cursor: pointer;
  color: var(--fg);
  font-size: 12px;
  text-align: center;
  user-select: none;
}

.desktop-icon .icon-glyph {
  font-size: 20px;
  border: 1px solid var(--fg);
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.desktop-icon:hover .icon-glyph {
  border-color: var(--accent);
  color: var(--accent);
}

#windows-container {
  position: absolute;
  inset: 0;
}

/* Window chrome */
.window {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border: 1px solid var(--fg);
  min-width: 200px;
  min-height: 150px;
}

.window.focused {
  border-color: var(--accent);
  box-shadow: 0 0 8px var(--accent);
}

.window-titlebar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-bottom: 1px solid var(--fg);
  cursor: move;
  font-size: 13px;
}

.window.focused .window-titlebar {
  color: var(--accent);
}

.window-controls span {
  cursor: pointer;
  margin-left: 8px;
}

.window-controls span:hover {
  color: var(--accent);
}

.window-body {
  flex: 1;
  overflow: auto;
  padding: 8px;
  font-size: 13px;
}

/* Taskbar */
#taskbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--taskbar-height);
  background: var(--bg);
  border-top: 1px solid var(--fg);
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 13px;
  gap: 16px;
  z-index: 500;
}

#taskbar-brand {
  color: var(--accent);
  font-weight: bold;
}

#taskbar-apps {
  flex: 1;
  display: flex;
  gap: 8px;
}

.taskbar-entry {
  border: 1px solid var(--fg);
  padding: 2px 8px;
  cursor: pointer;
}

.taskbar-entry.focused {
  border-color: var(--accent);
  color: var(--accent);
}

/* CRT scanline overlay */
.scanline-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 999;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.03) 0px,
    rgba(255, 255, 255, 0.03) 1px,
    transparent 1px,
    transparent 3px
  );
}
```

- [ ] **Step 4: Manual verification**

Run: `python -m http.server 8000` from `R:\stardance-webos`, then open `http://localhost:8000/`.

Expected: a black page with a faint scanline texture, a taskbar at the bottom showing "EMBERCROW OS" in ember orange on the left and nothing else yet. The empty `#desktop-bg-mascot` element renders nothing visible until Task 5 fills it. No console errors except a 404 for `js/main.js` (expected — created in Task 5).

- [ ] **Step 5: Commit**

```bash
git add package.json index.html style.css
git commit -m "chore: scaffold EMBERCROW OS shell and base theme"
```

---

## Task 2: Mascot ASCII Art Module

**Files:**
- Create: `js/mascot.js`
- Test: `tests/mascot.test.js`

- [ ] **Step 1: Write the failing test**

Create `tests/mascot.test.js`:

```js
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

test('MASCOT_LARGE uses dense fill characters for the silhouette', () => {
  assert.ok(MASCOT_LARGE.includes('@'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/mascot.test.js`
Expected: FAIL — `Cannot find module '../js/mascot.js'`

- [ ] **Step 3: Create `js/mascot.js`**

```js
export const MASCOT_SMALL = `        ▄▄▄▄
     ▄██████▄
   ▄████████▀o
  █████████▀
   ▀██▀▀
    ▀▀▄▄▄▄▄▄`;

export const MASCOT_LARGE = `            .           .          ...   .   .                    .          .                   .  
                   ..             .          .      .             .                            .    
    .                   .        .    . .     .     .       .   . .           .      .           .  
   ..                .          .                                .          .             ...   .   
             .                              .   . . .  .                 .:-  ..-.    ..         .  
     .      .    .   .      .       .    .         .   .                 .#-  .#+.                  
      .. .              .       .    .       .                   .       *%. .*@.   .=.        .    
.          .                                                       .*...-@=..*@- ..=@-.     .       
     .           .          .                                     .-% ..%%..#@+..:%@:.  .-:      .  
    .  . ....    .      .                              ..         .+*..@@.:@@=..%@#...-%+.          
         .=+..:..                         .             ..        .@:.%@-+@@::%@#:.+%@-......       
.     .  .#@*.#@=.                                         .     .##:%%=%@*=%@#-*@@*..:+%%=..       
  .     ##+@@+#@@::#:.                           .    .          =%=@@@@@@@@@@@@@+-%@@%-..          
        *@=@@@%@@%*@@=.....               .             .      .:@@@@@@@@@@@@@@@@@@@@@@@-.          
 . .    =@@*@@@@@@@@@@.=@#.   .  .                .           .=@@@@@@@@@@@@@@@@@@@@*=.             
     .  .%@@@@@@@@@@@@*%@@-.....       . .       .       . ..-@@@@@@@@@@@@@@@@@@@@@.   .            
    .   .-@@@@@@@@@@@@@@@@=:%@@-                        ..:%@@@@@@@@@@@@@@@@@@@@@=..                
     .   .*@@@@@@@@@@@@@@@@@@@@=++:.            .      .*@@@@@@@@@@@@@@@@@@@@@@@@=.                 
         ..*@@@@@@@@@@@@@@@@@@@@@@@-...            ..:%@@@@@@@@@@@@@@@@@@@@@@@@@@+.                 
   . . .    .*@@@@@@@@@@@@@@@@@@@@@@@@+. .        ..#@@@@@@@@@@@@@@@@@@@@@@@@@@@@*.                 
             ..:-*@@@@@@@@@@@@@@@@@@@@@@#=.     ..-@@@@@@@@@@@@@@@@@@@@@@@@@@@@@=.   .             .
            .     .-*@@@@@@@@@@@@@@@@@@@@@@*:...:#@@@@@@@@@@@@@@@@@@@@@@@@@@@@#.          .   .  .  
..   .                .*@@@@@@@@@@@@@@@@@@@@@@#*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@+.                     
  .    .          .      ..:+@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%..          .           
              .     .        ..-*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*..    .                   
 .       .   .. .                .-@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%%@%-..                        .  
             .               . .-@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@- ..           .                 
                     .  .     .+@@%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@#-.      .       .                 
     ..                 .    .#@@%%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%=:..                            
.                            .+..  ....:-+%@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@%*-... .                   
      ..                                  .......:::::-=+**-...:=++#%=-=#@@@@@@@%:..              . 
                               .    .      .               .      ...........-=**:.    .   .        
                                       .  ..              .     .   .                     .         
                                                                       .       . .                  
 .                           .       .                                                           .. 
.                                 .                      ..        .                  .             `;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/mascot.test.js`
Expected: PASS — `# pass 3`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/mascot.js tests/mascot.test.js
git commit -m "feat: add EMBERCROW ASCII mascot art"
```

---

## Task 3: Window Manager Core Logic

**Files:**
- Create: `js/windowManager.js`
- Test: `tests/windowManager.test.js`

- [ ] **Step 1: Write the failing tests**

Create `tests/windowManager.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/windowManager.test.js`
Expected: FAIL — `Cannot find module '../js/windowManager.js'`

- [ ] **Step 3: Create `js/windowManager.js`**

```js
const MIN_VISIBLE = 80;
const TITLE_BAR_HEIGHT = 30;
const CASCADE_STEP = 30;
const CASCADE_WRAP = 10;

export function clampPosition(x, y, width, height, viewportWidth, viewportHeight, taskbarHeight = 40) {
  const minX = -(width - MIN_VISIBLE);
  const maxX = viewportWidth - MIN_VISIBLE;
  const minY = 0;
  const maxY = viewportHeight - taskbarHeight - TITLE_BAR_HEIGHT;

  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  };
}

export function getCascadeOffset(index) {
  const step = index % CASCADE_WRAP;
  return { x: step * CASCADE_STEP, y: step * CASCADE_STEP };
}

export class WindowManager {
  constructor() {
    this.windows = [];
    this.nextId = 1;
    this.nextZIndex = 1;
  }

  open(appId, defaultSize) {
    const offset = getCascadeOffset(this.windows.length);
    const win = {
      id: this.nextId++,
      appId,
      x: 60 + offset.x,
      y: 60 + offset.y,
      width: defaultSize.width,
      height: defaultSize.height,
      zIndex: this.nextZIndex++,
      minimized: false,
    };
    this.windows.push(win);
    return win;
  }

  close(id) {
    this.windows = this.windows.filter((w) => w.id !== id);
  }

  focus(id) {
    const win = this.windows.find((w) => w.id === id);
    if (!win) return;
    win.zIndex = this.nextZIndex++;
    win.minimized = false;
  }

  minimize(id) {
    const win = this.windows.find((w) => w.id === id);
    if (!win) return;
    win.minimized = true;
  }

  move(id, x, y, viewportWidth, viewportHeight) {
    const win = this.windows.find((w) => w.id === id);
    if (!win) return;
    const clamped = clampPosition(x, y, win.width, win.height, viewportWidth, viewportHeight);
    win.x = clamped.x;
    win.y = clamped.y;
  }

  getTopWindow() {
    return this.windows
      .filter((w) => !w.minimized)
      .sort((a, b) => b.zIndex - a.zIndex)[0];
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/windowManager.test.js`
Expected: PASS — `# pass 8`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add js/windowManager.js tests/windowManager.test.js
git commit -m "feat: add pure WindowManager state/logic module"
```

---

## Task 4: Boot/Login Sequence

**Files:**
- Create: `js/boot.js`
- Test: `tests/boot.test.js`
- Modify: `style.css`

- [ ] **Step 1: Write the failing test**

Create `tests/boot.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/boot.test.js`
Expected: FAIL — `Cannot find module '../js/boot.js'`

> **Note:** this test file imports `SPLASH_TITLE` and `JITTER_DELAYS` in
> addition to `BOOT_LINES`, all defined in Step 3 below.

- [ ] **Step 3: Create `js/boot.js`**

```js
import { MASCOT_LARGE } from './mascot.js';

export const BOOT_LINES = [
  { text: 'EMBERCROW OS v1.0 -- boot sequence initiated', tag: '' },
  { text: 'Initializing kernel modules...', tag: 'OK' },
  { text: 'Mounting //embercrow/root...', tag: 'OK' },
  { text: 'Establishing secure shell...', tag: 'OK' },
  { text: 'Calibrating ember core...', tag: 'WARN' },
  { text: 'Loading window manager...', tag: 'OK' },
  { text: 'All systems nominal.', tag: '' },
];

export const SPLASH_TITLE = 'EMBERCROW OS';

// Irregular offsets (ms) for the splash glitch jitter bursts. Each entry is
// added to the previous one to schedule a class toggle on the mascot/title.
export const JITTER_DELAYS = [80, 160, 110, 220, 140];

const LINE_DELAY_MS = 250;
const SPLASH_SETTLE_MS = 900;
const SPLASH_HOLD_MS = 700;
const LOGIN_DELAY_MS = 500;
const GRANTED_DELAY_MS = 700;
const COLLAPSE_MS = 400;

export function playBoot(container, onComplete) {
  container.innerHTML = '';

  const log = document.createElement('div');
  log.className = 'boot-log';
  const mascotEl = document.createElement('pre');
  mascotEl.className = 'boot-mascot';
  const titleEl = document.createElement('div');
  titleEl.className = 'boot-title';
  const prompt = document.createElement('div');
  prompt.className = 'boot-prompt';
  container.append(log, mascotEl, titleEl, prompt);

  let finished = false;
  const timeouts = [];

  const finish = () => {
    if (finished) return;
    finished = true;
    for (const t of timeouts) clearTimeout(t);
    container.classList.add('boot-collapse');
    setTimeout(() => {
      container.style.display = 'none';
      onComplete();
    }, COLLAPSE_MS);
  };

  let delay = 0;
  for (const line of BOOT_LINES) {
    timeouts.push(setTimeout(() => {
      const lineEl = document.createElement('div');
      if (line.tag) {
        const tagEl = document.createElement('span');
        tagEl.className = 'boot-tag';
        tagEl.textContent = `[ ${line.tag} ] `;
        lineEl.appendChild(tagEl);
      }
      lineEl.appendChild(document.createTextNode(line.text));
      log.appendChild(lineEl);
    }, delay));
    delay += LINE_DELAY_MS;
  }

  // Splash reveal: hide the boot log and glitch the mascot + title into view.
  timeouts.push(setTimeout(() => {
    container.classList.add('boot-splash');
    mascotEl.textContent = MASCOT_LARGE;
    titleEl.textContent = SPLASH_TITLE;
    mascotEl.classList.add('glitch-in');
    titleEl.classList.add('glitch-in');

    let jitterDelay = 0;
    for (const jitter of JITTER_DELAYS) {
      jitterDelay += jitter;
      timeouts.push(setTimeout(() => {
        mascotEl.classList.toggle('jitter');
        titleEl.classList.toggle('jitter');
      }, jitterDelay));
    }
  }, delay));
  delay += SPLASH_SETTLE_MS;

  // Settle: drop the glitch/jitter classes and hold the steady splash.
  timeouts.push(setTimeout(() => {
    mascotEl.classList.remove('jitter', 'glitch-in');
    titleEl.classList.remove('jitter', 'glitch-in');
    mascotEl.classList.add('settled');
    titleEl.classList.add('settled');
  }, delay));
  delay += SPLASH_HOLD_MS;

  timeouts.push(setTimeout(() => {
    prompt.textContent = 'login: embercrow';
  }, delay));
  delay += LOGIN_DELAY_MS;

  timeouts.push(setTimeout(() => {
    prompt.textContent = 'login: embercrow -- access granted';
  }, delay));
  delay += GRANTED_DELAY_MS;

  timeouts.push(setTimeout(finish, delay));

  document.addEventListener('keydown', finish, { once: true });
  document.addEventListener('click', finish, { once: true });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/boot.test.js`
Expected: PASS — `# pass 4`, `# fail 0`

- [ ] **Step 5: Append splash/title/glitch styles to `style.css`**

Add this block right after the existing `.boot-prompt { margin-top: 16px; }`
rule and before the `/* Desktop */` section:

```css
/* Boot splash: mascot + title glitch reveal */
.boot-title {
  display: none;
  font-family: var(--font-display);
  font-size: 32px;
  letter-spacing: 0.3em;
  text-align: center;
  color: var(--accent);
  text-shadow: 0 0 8px var(--accent), 0 0 18px var(--accent);
  margin-top: 16px;
}

#boot-screen.boot-splash {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#boot-screen.boot-splash .boot-log {
  display: none;
}

#boot-screen.boot-splash .boot-mascot {
  margin-top: 0;
  font-size: 8px;
  line-height: 1.1;
  text-align: center;
}

#boot-screen.boot-splash .boot-title {
  display: block;
}

#boot-screen.boot-splash .boot-prompt {
  margin-top: 24px;
  font-size: 16px;
}

.boot-mascot.glitch-in,
.boot-title.glitch-in {
  animation: scanline-sweep 0.5s steps(6) infinite;
}

.boot-mascot.jitter,
.boot-title.jitter {
  transform: translate(2px, -1px);
  opacity: 0.7;
  clip-path: inset(0 0 8% 0);
}

.boot-mascot.settled,
.boot-title.settled {
  animation: text-flicker 3s infinite;
}

@keyframes scanline-sweep {
  0% { opacity: 0.3; clip-path: inset(0 0 90% 0); }
  50% { opacity: 1; clip-path: inset(0 0 0 0); }
  100% { opacity: 0.6; clip-path: inset(40% 0 0 0); }
}

@keyframes text-flicker {
  0%, 100% { opacity: 1; }
  92% { opacity: 1; }
  93% { opacity: 0.4; }
  94% { opacity: 1; }
}
```

- [ ] **Step 6: Commit**

```bash
git add js/boot.js tests/boot.test.js style.css
git commit -m "feat: add boot/login sequence with splash glitch reveal"
```

---

## Task 5: Main Shell — Window Rendering, Desktop, Taskbar

**Files:**
- Create: `js/apps.js`
- Create: `js/main.js`

- [ ] **Step 1: Create the empty app registry `js/apps.js`**

```js
export const apps = [];

export function getApp(id) {
  return apps.find((a) => a.id === id);
}
```

- [ ] **Step 2: Create `js/main.js`**

```js
import { WindowManager } from './windowManager.js';
import { apps, getApp } from './apps.js';
import { playBoot } from './boot.js';
import { MASCOT_LARGE } from './mascot.js';

const wm = new WindowManager();
const windowsContainer = document.getElementById('windows-container');
const desktopIcons = document.getElementById('desktop-icons');
const taskbarApps = document.getElementById('taskbar-apps');
const taskbarClock = document.getElementById('taskbar-clock');

const windowEls = new Map();
const taskbarEls = new Map();

function updateFocusStyles() {
  const top = wm.getTopWindow();
  for (const win of wm.windows) {
    const el = windowEls.get(win.id);
    if (!el) continue;
    el.style.zIndex = String(win.zIndex);
    el.classList.toggle('focused', !!top && top.id === win.id);
    const entry = taskbarEls.get(win.id);
    if (entry) entry.classList.toggle('focused', !!top && top.id === win.id);
  }
}

function closeWindow(id) {
  wm.close(id);
  windowEls.get(id)?.remove();
  windowEls.delete(id);
  taskbarEls.get(id)?.remove();
  taskbarEls.delete(id);
  updateFocusStyles();
}

function focusWindow(id) {
  wm.focus(id);
  const el = windowEls.get(id);
  if (el) el.style.display = '';
  updateFocusStyles();
}

function minimizeWindow(id) {
  wm.minimize(id);
  const el = windowEls.get(id);
  if (el) el.style.display = 'none';
  updateFocusStyles();
}

function startDrag(id, startEvent) {
  const win = wm.windows.find((w) => w.id === id);
  const el = windowEls.get(id);
  const startX = startEvent.clientX;
  const startY = startEvent.clientY;
  const originX = win.x;
  const originY = win.y;

  const onMove = (e) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    wm.move(id, originX + dx, originY + dy, window.innerWidth, window.innerHeight);
    el.style.left = `${win.x}px`;
    el.style.top = `${win.y}px`;
  };
  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function openApp(appId) {
  const app = getApp(appId);
  if (!app) return;
  const win = wm.open(appId, app.defaultSize);

  const el = document.createElement('div');
  el.className = 'window';
  el.style.left = `${win.x}px`;
  el.style.top = `${win.y}px`;
  el.style.width = `${win.width}px`;
  el.style.height = `${win.height}px`;

  const titlebar = document.createElement('div');
  titlebar.className = 'window-titlebar';

  const titleText = document.createElement('span');
  titleText.textContent = `${app.icon} ${app.title}`;

  const controls = document.createElement('span');
  controls.className = 'window-controls';
  const minBtn = document.createElement('span');
  minBtn.textContent = '[_]';
  const closeBtn = document.createElement('span');
  closeBtn.textContent = '[x]';
  controls.append(minBtn, closeBtn);

  titlebar.append(titleText, controls);

  const body = document.createElement('div');
  body.className = 'window-body';

  el.append(titlebar, body);
  windowsContainer.appendChild(el);
  windowEls.set(win.id, el);

  app.createContent(body);

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target === minBtn || e.target === closeBtn) return;
    focusWindow(win.id);
    startDrag(win.id, e);
  });
  el.addEventListener('mousedown', () => focusWindow(win.id));
  minBtn.addEventListener('click', () => minimizeWindow(win.id));
  closeBtn.addEventListener('click', () => closeWindow(win.id));

  const taskbarEntry = document.createElement('div');
  taskbarEntry.className = 'taskbar-entry';
  taskbarEntry.textContent = `${app.icon} ${app.title}`;
  taskbarEntry.addEventListener('click', () => {
    const top = wm.getTopWindow();
    if (win.minimized || !top || top.id !== win.id) {
      focusWindow(win.id);
    } else {
      minimizeWindow(win.id);
    }
  });
  taskbarApps.appendChild(taskbarEntry);
  taskbarEls.set(win.id, taskbarEntry);

  focusWindow(win.id);
}

function renderDesktopIcons() {
  for (const app of apps) {
    const icon = document.createElement('div');
    icon.className = 'desktop-icon';

    const glyph = document.createElement('div');
    glyph.className = 'icon-glyph';
    glyph.textContent = app.icon;

    const label = document.createElement('div');
    label.textContent = app.title;

    icon.append(glyph, label);
    icon.addEventListener('dblclick', () => openApp(app.id));
    desktopIcons.appendChild(icon);
  }
}

function updateClock() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  taskbarClock.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

function init() {
  document.getElementById('desktop-bg-mascot').textContent = MASCOT_LARGE;
  renderDesktopIcons();
  updateClock();
  setInterval(updateClock, 1000);
}

playBoot(document.getElementById('boot-screen'), init);
```

- [ ] **Step 3: Manual verification**

Run: `python -m http.server 8000` from `R:\stardance-webos`, open `http://localhost:8000/`.

Expected:
- Boot log lines appear one by one with `[ OK ]` / `[WARN]` tags in ember orange.
- The boot log then disappears and a full-screen splash takes over: the large EMBERCROW ASCII mascot and the "EMBERCROW OS" title (angular Orbitron font, ember glow) glitch/flicker into view via brief position/opacity/clip jitter plus a scanline sweep, then settle into a steady ember flicker.
- After the splash settles, `login: embercrow` appears below it, followed by `-- access granted`.
- Boot screen fades out, revealing a desktop with the same mascot art rendered faintly (low-opacity watermark) centered behind the (still empty) desktop icon area, and a taskbar with "EMBERCROW OS" branding and a live clock updating every second.
- Clicking or pressing a key during boot skips straight to the desktop.
- No console errors.

- [ ] **Step 4: Commit**

```bash
git add js/apps.js js/main.js
git commit -m "feat: wire up window rendering, desktop shell, and taskbar"
```

---

## Task 6: Terminal App

**Files:**
- Create: `js/apps/terminal.js`
- Test: `tests/terminal.test.js`
- Modify: `js/apps.js`
- Modify: `style.css`

- [ ] **Step 1: Write the failing tests**

Create `tests/terminal.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { runCommand } from '../js/apps/terminal.js';

test('help lists available commands', () => {
  const result = runCommand('help');
  assert.ok(result.lines.some((line) => line.includes('whoami')));
});

test('whoami returns embercrow', () => {
  assert.deepEqual(runCommand('whoami'), { lines: ['embercrow'] });
});

test('ls lists the fake filesystem entries', () => {
  const result = runCommand('ls');
  assert.deepEqual(result.lines, ['projects/', 'logs/', 'secrets.txt', 'notes.txt']);
});

test('date uses the injected clock', () => {
  const fixed = () => new Date(2026, 0, 1, 12, 0, 0);
  assert.deepEqual(runCommand('date', { now: fixed }), { lines: [fixed().toString()] });
});

test('clear returns a clear flag with no lines', () => {
  assert.deepEqual(runCommand('clear'), { lines: [], clear: true });
});

test('crow prints the provided mascot lines', () => {
  const result = runCommand('crow', { mascot: 'A\nB' });
  assert.deepEqual(result.lines, ['A', 'B']);
});

test('unknown commands report command not found', () => {
  assert.deepEqual(runCommand('foo'), { lines: ['command not found: foo'] });
});

test('empty input produces no output', () => {
  assert.deepEqual(runCommand(''), { lines: [] });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/terminal.test.js`
Expected: FAIL — `Cannot find module '../js/apps/terminal.js'`

- [ ] **Step 3: Create `js/apps/terminal.js`**

```js
import { MASCOT_SMALL } from '../mascot.js';

const HELP_LINES = [
  'Available commands:',
  '  help     - show this help text',
  '  about    - about EMBERCROW OS',
  '  ls       - list files in the current directory',
  '  whoami   - print the current user',
  '  date     - print the current date and time',
  '  crow     - display the EMBERCROW mascot',
  '  clear    - clear the terminal',
];

const LS_LINES = ['projects/', 'logs/', 'secrets.txt', 'notes.txt'];

export function runCommand(input, { now = () => new Date(), mascot = MASCOT_SMALL } = {}) {
  const cmd = input.trim();
  switch (cmd) {
    case '':
      return { lines: [] };
    case 'help':
      return { lines: HELP_LINES };
    case 'about':
      return { lines: ['EMBERCROW OS v1.0', 'A hacker-themed web desktop.'] };
    case 'ls':
      return { lines: LS_LINES };
    case 'whoami':
      return { lines: ['embercrow'] };
    case 'date':
      return { lines: [now().toString()] };
    case 'crow':
      return { lines: mascot.split('\n') };
    case 'clear':
      return { lines: [], clear: true };
    default:
      return { lines: [`command not found: ${cmd}`] };
  }
}

export const terminalApp = {
  id: 'terminal',
  title: 'Terminal',
  icon: '>_',
  defaultSize: { width: 480, height: 320 },
  createContent(container) {
    container.classList.add('app-terminal');

    const output = document.createElement('div');
    output.className = 'terminal-output';

    const inputLine = document.createElement('div');
    inputLine.className = 'terminal-input-line';
    const prompt = document.createElement('span');
    prompt.textContent = 'embercrow:~$ ';
    const input = document.createElement('input');
    input.className = 'terminal-input';
    input.setAttribute('autocomplete', 'off');
    inputLine.append(prompt, input);

    container.append(output, inputLine);

    const printLines = (lines) => {
      for (const line of lines) {
        const lineEl = document.createElement('div');
        lineEl.textContent = line;
        output.appendChild(lineEl);
      }
      container.scrollTop = container.scrollHeight;
    };

    printLines(['EMBERCROW OS Terminal v1.0', 'Type "help" for a list of commands.', '']);

    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const value = input.value;
      const echo = document.createElement('div');
      echo.textContent = `embercrow:~$ ${value}`;
      output.appendChild(echo);

      const result = runCommand(value);
      if (result.clear) {
        output.innerHTML = '';
      } else {
        printLines(result.lines);
      }
      input.value = '';
      container.scrollTop = container.scrollHeight;
    });

    input.focus();
  },
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/terminal.test.js`
Expected: PASS — `# pass 8`, `# fail 0`

- [ ] **Step 5: Register the app in `js/apps.js`**

Replace the contents of `js/apps.js`:

```js
import { terminalApp } from './apps/terminal.js';

export const apps = [terminalApp];

export function getApp(id) {
  return apps.find((a) => a.id === id);
}
```

- [ ] **Step 6: Append Terminal styles to `style.css`**

```css
/* Terminal */
.app-terminal {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.terminal-output {
  flex: 1;
  overflow-y: auto;
  white-space: pre-wrap;
}

.terminal-input-line {
  display: flex;
}

.terminal-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--fg);
  font-family: var(--font-mono);
  font-size: 13px;
  outline: none;
  caret-color: var(--accent);
}
```

- [ ] **Step 7: Manual verification**

Run: `python -m http.server 8000`, open `http://localhost:8000/`, skip boot, double-click the Terminal icon.

Expected: a draggable Terminal window opens with a welcome message and a `embercrow:~$ ` prompt. Typing `help`, `whoami`, `ls`, `date`, `crow`, `clear`, and a nonsense command each produce the expected output. The window can be dragged by its title bar, focused (ember glow), minimized via `[_]` (disappears, taskbar entry remains), restored by clicking the taskbar entry, and closed via `[x]`.

- [ ] **Step 8: Commit**

```bash
git add js/apps/terminal.js tests/terminal.test.js js/apps.js style.css
git commit -m "feat: add Terminal app"
```

---

## Task 7: File Explorer App

**Files:**
- Create: `js/apps/files.js`
- Test: `tests/files.test.js`
- Modify: `js/apps.js`
- Modify: `style.css`

- [ ] **Step 1: Write the failing tests**

Create `tests/files.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { fileTree, findNode } from '../js/apps/files.js';

test('findNode returns the root for an empty path', () => {
  assert.equal(findNode(fileTree, []), fileTree);
});

test('findNode finds a nested file and returns its content', () => {
  const node = findNode(fileTree, ['projects', 'embercrow-os.txt']);
  assert.equal(node.type, 'file');
  assert.ok(node.content.includes('in progress'));
});

test('findNode returns null for a missing path', () => {
  assert.equal(findNode(fileTree, ['nope']), null);
});

test('findNode returns null when traversing into a file', () => {
  assert.equal(findNode(fileTree, ['secrets.txt', 'x']), null);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/files.test.js`
Expected: FAIL — `Cannot find module '../js/apps/files.js'`

- [ ] **Step 3: Create `js/apps/files.js`**

```js
export const fileTree = {
  name: 'embercrow',
  type: 'folder',
  children: [
    {
      name: 'projects',
      type: 'folder',
      children: [
        {
          name: 'embercrow-os.txt',
          type: 'file',
          content: 'status: in progress\nnext: polish the boot sequence',
        },
      ],
    },
    {
      name: 'logs',
      type: 'folder',
      children: [
        {
          name: 'boot.log',
          type: 'file',
          content: '[ OK ] kernel loaded\n[ OK ] shell ready',
        },
      ],
    },
    { name: 'secrets.txt', type: 'file', content: 'there are no secrets. only static.' },
    { name: 'notes.txt', type: 'file', content: 'see the Notes app for your real notes' },
  ],
};

export function findNode(tree, path) {
  if (path.length === 0) return tree;
  if (tree.type !== 'folder') return null;
  const [head, ...rest] = path;
  const child = tree.children.find((c) => c.name === head);
  if (!child) return null;
  return findNode(child, rest);
}

export const filesApp = {
  id: 'files',
  title: 'File Explorer',
  icon: '[/]',
  defaultSize: { width: 480, height: 340 },
  createContent(container) {
    container.classList.add('app-files');

    const tree = document.createElement('div');
    tree.className = 'files-tree';

    const view = document.createElement('pre');
    view.className = 'files-view';
    view.textContent = 'Select a file to view its contents.';

    container.append(tree, view);

    const renderNode = (node, depth, parentEl) => {
      const item = document.createElement('div');
      item.className = 'files-item';
      item.style.paddingLeft = `${depth * 16}px`;

      if (node.type === 'folder') {
        item.textContent = `[+] ${node.name}/`;
        const childWrap = document.createElement('div');
        childWrap.style.display = 'none';

        item.addEventListener('click', () => {
          const isOpen = childWrap.style.display !== 'none';
          childWrap.style.display = isOpen ? 'none' : 'block';
          item.textContent = `${isOpen ? '[+]' : '[-]'} ${node.name}/`;
        });

        parentEl.append(item, childWrap);
        for (const child of node.children) {
          renderNode(child, depth + 1, childWrap);
        }
      } else {
        item.textContent = `    ${node.name}`;
        item.addEventListener('click', () => {
          view.textContent = node.content;
        });
        parentEl.append(item);
      }
    };

    for (const child of fileTree.children) {
      renderNode(child, 0, tree);
    }
  },
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/files.test.js`
Expected: PASS — `# pass 4`, `# fail 0`

- [ ] **Step 5: Register the app in `js/apps.js`**

Replace the contents of `js/apps.js`:

```js
import { terminalApp } from './apps/terminal.js';
import { filesApp } from './apps/files.js';

export const apps = [terminalApp, filesApp];

export function getApp(id) {
  return apps.find((a) => a.id === id);
}
```

- [ ] **Step 6: Append File Explorer styles to `style.css`**

```css
/* File Explorer */
.app-files {
  display: flex;
  height: 100%;
  gap: 8px;
}

.files-tree {
  width: 40%;
  overflow-y: auto;
}

.files-item {
  cursor: pointer;
  white-space: nowrap;
}

.files-item:hover {
  color: var(--accent);
}

.files-view {
  flex: 1;
  border-left: 1px solid var(--fg);
  padding-left: 8px;
  margin: 0;
  white-space: pre-wrap;
  overflow-y: auto;
}
```

- [ ] **Step 7: Manual verification**

Reload `http://localhost:8000/`, skip boot, double-click File Explorer.

Expected: a window with a folder tree (`projects/`, `logs/`, `secrets.txt`, `notes.txt`). Clicking `projects/` or `logs/` expands/collapses to show nested files. Clicking a file shows its content in the right pane.

- [ ] **Step 8: Commit**

```bash
git add js/apps/files.js tests/files.test.js js/apps.js style.css
git commit -m "feat: add File Explorer app"
```

---

## Task 8: About/Profile App

**Files:**
- Create: `js/apps/about.js`
- Test: `tests/about.test.js`
- Modify: `js/apps.js`
- Modify: `style.css`

- [ ] **Step 1: Write the failing tests**

Create `tests/about.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/about.test.js`
Expected: FAIL — `Cannot find module '../js/apps/about.js'`

- [ ] **Step 3: Create `js/apps/about.js`**

```js
import { MASCOT_SMALL } from '../mascot.js';

export function formatUptime(startMs, nowMs) {
  const totalSeconds = Math.max(0, Math.floor((nowMs - startMs) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export const aboutApp = {
  id: 'about',
  title: 'About',
  icon: '(i)',
  defaultSize: { width: 420, height: 280 },
  createContent(container) {
    container.classList.add('app-about');

    const mascotEl = document.createElement('pre');
    mascotEl.className = 'about-mascot';
    mascotEl.textContent = MASCOT_SMALL;

    const info = document.createElement('pre');
    info.className = 'about-info';

    const openedAt = Date.now();
    const render = () => {
      info.textContent = [
        'EMBERCROW OS v1.0',
        'A hacker-themed web desktop.',
        '',
        `uptime: ${formatUptime(openedAt, Date.now())}`,
        'author: razvanandrei293',
      ].join('\n');
    };

    render();
    setInterval(render, 1000);

    container.append(mascotEl, info);
  },
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/about.test.js`
Expected: PASS — `# pass 3`, `# fail 0`

- [ ] **Step 5: Register the app in `js/apps.js`**

Replace the contents of `js/apps.js`:

```js
import { terminalApp } from './apps/terminal.js';
import { filesApp } from './apps/files.js';
import { aboutApp } from './apps/about.js';

export const apps = [terminalApp, filesApp, aboutApp];

export function getApp(id) {
  return apps.find((a) => a.id === id);
}
```

- [ ] **Step 6: Append About styles to `style.css`**

```css
/* About */
.app-about {
  display: flex;
  gap: 12px;
  height: 100%;
}

.about-mascot {
  color: var(--accent);
  margin: 0;
}

.about-info {
  margin: 0;
}
```

- [ ] **Step 7: Manual verification**

Reload `http://localhost:8000/`, skip boot, double-click About.

Expected: a window showing the small ASCII mascot (ember-colored) next to "EMBERCROW OS v1.0", a description, an `uptime: 00:00:0x` counter that increments every second, and an author line.

- [ ] **Step 8: Commit**

```bash
git add js/apps/about.js tests/about.test.js js/apps.js style.css
git commit -m "feat: add About app"
```

---

## Task 9: Notes App

**Files:**
- Create: `js/apps/notes.js`
- Test: `tests/notes.test.js`
- Modify: `js/apps.js`
- Modify: `style.css`

- [ ] **Step 1: Write the failing tests**

Create `tests/notes.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert';
import { createNotesStore } from '../js/apps/notes.js';

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
  };
}

test('load returns an empty string when nothing is saved', () => {
  const store = createNotesStore(createMemoryStorage());
  assert.equal(store.load(), '');
});

test('save then load returns the saved text', () => {
  const store = createNotesStore(createMemoryStorage());
  store.save('hello world');
  assert.equal(store.load(), 'hello world');
});

test('save overwrites previously saved content', () => {
  const store = createNotesStore(createMemoryStorage());
  store.save('first');
  store.save('second');
  assert.equal(store.load(), 'second');
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/notes.test.js`
Expected: FAIL — `Cannot find module '../js/apps/notes.js'`

- [ ] **Step 3: Create `js/apps/notes.js`**

```js
const STORAGE_KEY = 'embercrow-notes';

export function createNotesStore(storage) {
  return {
    load() {
      return storage.getItem(STORAGE_KEY) ?? '';
    },
    save(text) {
      storage.setItem(STORAGE_KEY, text);
    },
  };
}

export const notesApp = {
  id: 'notes',
  title: 'Notes',
  icon: '[=]',
  defaultSize: { width: 400, height: 300 },
  createContent(container) {
    container.classList.add('app-notes');

    const store = createNotesStore(window.localStorage);
    const textarea = document.createElement('textarea');
    textarea.className = 'notes-textarea';
    textarea.value = store.load();
    textarea.placeholder = 'Write something...';

    textarea.addEventListener('input', () => {
      store.save(textarea.value);
    });

    container.appendChild(textarea);
  },
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/notes.test.js`
Expected: PASS — `# pass 3`, `# fail 0`

- [ ] **Step 5: Register the app in `js/apps.js`**

Replace the contents of `js/apps.js`:

```js
import { terminalApp } from './apps/terminal.js';
import { filesApp } from './apps/files.js';
import { aboutApp } from './apps/about.js';
import { notesApp } from './apps/notes.js';

export const apps = [terminalApp, filesApp, aboutApp, notesApp];

export function getApp(id) {
  return apps.find((a) => a.id === id);
}
```

- [ ] **Step 6: Append Notes styles to `style.css`**

```css
/* Notes */
.app-notes {
  height: 100%;
}

.notes-textarea {
  width: 100%;
  height: 100%;
  background: transparent;
  color: var(--fg);
  border: none;
  resize: none;
  font-family: var(--font-mono);
  font-size: 13px;
  outline: none;
}

.notes-textarea::placeholder {
  color: var(--fg);
  opacity: 0.4;
}
```

- [ ] **Step 7: Manual verification**

Reload `http://localhost:8000/`, skip boot, double-click Notes, type some text, then reload the page and skip boot again, then reopen Notes.

Expected: the typed text persists across the reload (saved via `localStorage`).

- [ ] **Step 8: Commit**

```bash
git add js/apps/notes.js tests/notes.test.js js/apps.js style.css
git commit -m "feat: add Notes app with localStorage persistence"
```

---

## Task 10: Music Player App

**Files:**
- Create: `js/apps/music.js`
- Test: `tests/music.test.js`
- Modify: `js/apps.js`
- Modify: `style.css`

- [ ] **Step 1: Write the failing tests**

Create `tests/music.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test tests/music.test.js`
Expected: FAIL — `Cannot find module '../js/apps/music.js'`

- [ ] **Step 3: Create `js/apps/music.js`**

```js
const ROOT_FREQ = 110; // A2
const PATTERN = [0, 3, 7, 10, 12, 10, 7, 3]; // semitone steps
const STEP_MS = 200;
const NOTE_LENGTH_S = 0.18;

export function createArpeggioSequence(rootFreq, semitoneSteps) {
  return semitoneSteps.map((step) => rootFreq * Math.pow(2, step / 12));
}

export const musicApp = {
  id: 'music',
  title: 'Music',
  icon: '(>)',
  defaultSize: { width: 360, height: 220 },
  createContent(container) {
    container.classList.add('app-music');

    const label = document.createElement('div');
    label.className = 'music-track';
    label.textContent = 'EMBERCROW - signal.wav';

    const canvas = document.createElement('canvas');
    canvas.className = 'music-visualizer';
    canvas.width = 320;
    canvas.height = 80;

    const button = document.createElement('button');
    button.className = 'music-toggle';
    button.textContent = 'play';

    container.append(label, canvas, button);

    const sequence = createArpeggioSequence(ROOT_FREQ, PATTERN);
    const ctx2d = canvas.getContext('2d');

    let audioCtx = null;
    let analyser = null;
    let stepIndex = 0;
    let intervalId = null;
    let rafId = null;
    let playing = false;

    const draw = () => {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      ctx2d.fillStyle = '#0a0a0a';
      ctx2d.fillRect(0, 0, canvas.width, canvas.height);
      ctx2d.fillStyle = '#ff5c2b';
      const barWidth = canvas.width / data.length;
      for (let i = 0; i < data.length; i++) {
        const barHeight = (data[i] / 255) * canvas.height;
        ctx2d.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight);
      }
      rafId = requestAnimationFrame(draw);
    };

    const playStep = () => {
      const osc = audioCtx.createOscillator();
      osc.type = 'square';
      osc.frequency.value = sequence[stepIndex % sequence.length];

      const gain = audioCtx.createGain();
      gain.gain.value = 0.1;

      osc.connect(gain);
      gain.connect(analyser);
      analyser.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + NOTE_LENGTH_S);
      stepIndex++;
    };

    button.addEventListener('click', () => {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
      }

      playing = !playing;
      button.textContent = playing ? 'pause' : 'play';

      if (playing) {
        playStep();
        intervalId = setInterval(playStep, STEP_MS);
        draw();
      } else {
        clearInterval(intervalId);
        cancelAnimationFrame(rafId);
      }
    });
  },
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test tests/music.test.js`
Expected: PASS — `# pass 3`, `# fail 0`

- [ ] **Step 5: Register the app in `js/apps.js`**

Replace the contents of `js/apps.js`:

```js
import { terminalApp } from './apps/terminal.js';
import { filesApp } from './apps/files.js';
import { aboutApp } from './apps/about.js';
import { notesApp } from './apps/notes.js';
import { musicApp } from './apps/music.js';

export const apps = [terminalApp, filesApp, aboutApp, notesApp, musicApp];

export function getApp(id) {
  return apps.find((a) => a.id === id);
}
```

- [ ] **Step 6: Append Music styles to `style.css`**

```css
/* Music */
.app-music {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  height: 100%;
  justify-content: center;
}

.music-track {
  color: var(--accent);
}

.music-visualizer {
  background: var(--bg);
  border: 1px solid var(--fg);
}

.music-toggle {
  background: transparent;
  border: 1px solid var(--fg);
  color: var(--fg);
  font-family: var(--font-mono);
  padding: 4px 16px;
  cursor: pointer;
}

.music-toggle:hover {
  border-color: var(--accent);
  color: var(--accent);
}
```

- [ ] **Step 7: Manual verification**

Reload `http://localhost:8000/`, skip boot, double-click Music, click "play".

Expected: button toggles to "pause", an audible square-wave arpeggio loop plays, and the canvas shows an ember-colored frequency bar visualizer animating in sync with the notes. Clicking "pause" stops both sound and animation.

- [ ] **Step 8: Commit**

```bash
git add js/apps/music.js tests/music.test.js js/apps.js style.css
git commit -m "feat: add Music Player app with arpeggio synth and visualizer"
```

---

## Task 11: Final Integration, README, and Full Walkthrough

**Files:**
- Create: `README.md`

- [ ] **Step 1: Run the full test suite**

Run: `node --test tests/`
Expected: PASS — all suites green (`# pass 36`, `# fail 0` across `mascot`, `windowManager`, `boot`, `terminal`, `files`, `about`, `notes`, `music`).

- [ ] **Step 2: Create `README.md`**

```markdown
# EMBERCROW OS

A hacker-themed, black & white web desktop with an ember-orange accent,
built with plain HTML/CSS/JS (no frameworks, no build step).

## Running locally

```bash
python -m http.server 8000
```

Then open http://localhost:8000/ in a browser.

## Running tests

```bash
node --test tests/
```

## Apps

- **Terminal** (`>_`) - type `help` for a list of commands
- **File Explorer** (`[/]`) - browse a fake filesystem
- **About** (`(i)`) - system info and uptime
- **Notes** (`[=]`) - a text editor that saves to localStorage
- **Music** (`(>)`) - a synth arpeggio player with a visualizer

## Controls

- Drag a window by its title bar
- `[_]` minimizes to the taskbar, `[x]` closes
- Click a window or its taskbar entry to focus it
- Press any key or click during boot to skip the intro
```

- [ ] **Step 3: Full manual walkthrough**

Run: `python -m http.server 8000`, open `http://localhost:8000/`.

Walk through and confirm:
- Boot sequence plays fully at least once: boot log lines, then the full-screen glitch splash (mascot + "EMBERCROW OS" title in Orbitron with ember glow), settling into a steady flicker, then login/access granted, then the collapse transition. The whole sequence is skippable via any key/click.
- The desktop shows the EMBERCROW mascot as a faint, centered, low-opacity watermark behind the icons and windows.
- All 5 desktop icons are visible and double-clicking each opens its window.
- Each window can be dragged, focused (ember glow + taskbar highlight), minimized, restored from the taskbar, and closed.
- Multiple windows opened together cascade rather than perfectly overlapping.
- Terminal: `help`, `about`, `ls`, `whoami`, `date`, `crow`, `clear`, and an unknown command all behave as expected.
- File Explorer: folders expand/collapse, file contents display on click.
- About: uptime counter increments.
- Notes: text persists after a full page reload.
- Music: play/pause toggles audio and the visualizer animation.
- No errors in the browser console throughout.

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add README with run/test instructions"
```

---

## Devlog Checkpoints (for the mission's 3+ devlog requirement)

- **Devlog 1** — after Task 5: window manager, desktop shell, taskbar, and boot sequence are working end-to-end (even with no apps yet).
- **Devlog 2** — after Task 9: Terminal, File Explorer, About, and Notes apps are in place and usable.
- **Devlog 3** — after Task 11: Music app added, full theme polish (scanlines, ember glow, mascot), final walkthrough complete.
