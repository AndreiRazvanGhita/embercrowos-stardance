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
    const intervalId = setInterval(() => {
      if (!container.isConnected) {
        clearInterval(intervalId);
        return;
      }
      render();
    }, 1000);

    container.append(mascotEl, info);
  },
};
