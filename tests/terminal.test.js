import { test } from 'node:test';
import assert from 'node:assert';
import { runCommand } from '../js/apps/terminal.js';

test('help lists available commands', () => {
  const result = runCommand('help');
  assert.ok(result.lines.some((line) => line.includes('whoami')));
});

test('whoami returns embercrow', () => {
  assert.deepEqual(runCommand('whoami'), { lines: ['embercrow'] });
});

test('ls lists the fake filesystem entries', () => {
  const result = runCommand('ls');
  assert.deepEqual(result.lines, ['projects/', 'logs/', 'secrets.txt', 'notes.txt']);
});

test('date uses the injected clock', () => {
  const fixed = () => new Date(2026, 0, 1, 12, 0, 0);
  assert.deepEqual(runCommand('date', { now: fixed }), { lines: [fixed().toString()] });
});

test('clear returns a clear flag with no lines', () => {
  assert.deepEqual(runCommand('clear'), { lines: [], clear: true });
});

test('crow prints the provided mascot lines', () => {
  const result = runCommand('crow', { mascot: 'A\nB' });
  assert.deepEqual(result.lines, ['A', 'B']);
});

test('unknown commands report command not found', () => {
  assert.deepEqual(runCommand('foo'), { lines: ['command not found: foo'] });
});

test('empty input produces no output', () => {
  assert.deepEqual(runCommand(''), { lines: [] });
});
