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
    document.removeEventListener('keydown', finish);
    document.removeEventListener('click', finish);
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
