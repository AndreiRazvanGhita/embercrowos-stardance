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

const LINE_DELAY_MS = 250;
const MASCOT_DELAY_MS = 400;
const LOGIN_DELAY_MS = 500;
const GRANTED_DELAY_MS = 700;
const COLLAPSE_MS = 400;

export function playBoot(container, onComplete) {
  container.innerHTML = '';

  const log = document.createElement('div');
  log.className = 'boot-log';
  const mascotEl = document.createElement('pre');
  mascotEl.className = 'boot-mascot';
  const prompt = document.createElement('div');
  prompt.className = 'boot-prompt';
  container.append(log, mascotEl, prompt);

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

  timeouts.push(setTimeout(() => {
    mascotEl.textContent = MASCOT_LARGE;
  }, delay));
  delay += MASCOT_DELAY_MS;

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
