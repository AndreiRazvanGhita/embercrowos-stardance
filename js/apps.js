import { terminalApp } from './apps/terminal.js';
import { filesApp } from './apps/files.js';
import { aboutApp } from './apps/about.js';

export const apps = [terminalApp, filesApp, aboutApp];

export function getApp(id) {
  return apps.find((a) => a.id === id);
}
