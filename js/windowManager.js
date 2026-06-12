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
