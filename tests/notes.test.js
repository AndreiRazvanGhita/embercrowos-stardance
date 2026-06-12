import { test } from 'node:test';
import assert from 'node:assert';
import { createNotesStore } from '../js/apps/notes.js';

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
  };
}

test('load returns an empty string when nothing is saved', () => {
  const store = createNotesStore(createMemoryStorage());
  assert.equal(store.load(), '');
});

test('save then load returns the saved text', () => {
  const store = createNotesStore(createMemoryStorage());
  store.save('hello world');
  assert.equal(store.load(), 'hello world');
});

test('save overwrites previously saved content', () => {
  const store = createNotesStore(createMemoryStorage());
  store.save('first');
  store.save('second');
  assert.equal(store.load(), 'second');
});
