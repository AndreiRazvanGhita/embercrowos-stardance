import { test } from 'node:test';
import assert from 'node:assert';
import { THEMES, getNextTheme } from '../js/themes.js';

test('THEMES contains ember, phosphor, and cyber in order', () => {
  assert.deepEqual(THEMES.map((t) => t.name), ['ember', 'phosphor', 'cyber']);
});

test('getNextTheme cycles ember -> phosphor -> cyber -> ember', () => {
  assert.equal(getNextTheme('ember').name, 'phosphor');
  assert.equal(getNextTheme('phosphor').name, 'cyber');
  assert.equal(getNextTheme('cyber').name, 'ember');
});

test('getNextTheme returns the first theme for an unrecognized name', () => {
  assert.equal(getNextTheme('unknown').name, 'ember');
  assert.equal(getNextTheme(undefined).name, 'ember');
});

test('getNextTheme works with a custom themes array', () => {
  const custom = [{ name: 'a', accent: '#111' }, { name: 'b', accent: '#222' }];
  assert.equal(getNextTheme('a', custom).name, 'b');
  assert.equal(getNextTheme('b', custom).name, 'a');
});
