import { terminalApp } from './apps/terminal.js';
import { filesApp } from './apps/files.js';
import { aboutApp } from './apps/about.js';
import { notesApp } from './apps/notes.js';

export const apps = [terminalApp, filesApp, aboutApp, notesApp];

export function getApp(id) {
  return apps.find((a) => a.id === id);
}
