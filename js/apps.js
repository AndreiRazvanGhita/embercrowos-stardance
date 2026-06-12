import { terminalApp } from './apps/terminal.js';

export const apps = [terminalApp];

export function getApp(id) {
  return apps.find((a) => a.id === id);
}
