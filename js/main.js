import { WindowManager } from './windowManager.js';
import { apps, getApp } from './apps.js';
import { playBoot } from './boot.js';
import { MASCOT_LARGE } from './mascot.js';
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
  updatePresenceGlow();
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
  updatePresenceGlow();
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

let presenceEyeEl = null;

function renderDesktopMascot() {
  const mascotEl = document.getElementById('desktop-bg-mascot');
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

function scheduleBlink(eyeEl) {
  setTimeout(() => {
    if (!presenceIdle) {
      eyeEl.classList.add('blinking');
      setTimeout(() => eyeEl.classList.remove('blinking'), 150);
    }
    scheduleBlink(eyeEl);
  }, getNextBlinkDelay());
}

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

playBoot(document.getElementById('boot-screen'), init);
