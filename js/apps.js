import { terminalApp } from './apps/terminal.js';
import { filesApp } from './apps/files.js';

export const apps = [terminalApp, filesApp];

export function getApp(id) {
  return apps.find((a) => a.id === id);
}
