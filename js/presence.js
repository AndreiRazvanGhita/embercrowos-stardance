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
  const ratioX = centerX === 0 ? 0 : (cursorX - centerX) / centerX;
  const ratioY = centerY === 0 ? 0 : (cursorY - centerY) / centerY;
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
