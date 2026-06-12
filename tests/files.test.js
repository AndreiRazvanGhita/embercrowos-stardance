import { test } from 'node:test';
import assert from 'node:assert';
import { fileTree, findNode } from '../js/apps/files.js';

test('findNode returns the root for an empty path', () => {
  assert.equal(findNode(fileTree, []), fileTree);
});

test('findNode finds a nested file and returns its content', () => {
  const node = findNode(fileTree, ['projects', 'embercrow-os.txt']);
  assert.equal(node.type, 'file');
  assert.ok(node.content.includes('in progress'));
});

test('findNode returns null for a missing path', () => {
  assert.equal(findNode(fileTree, ['nope']), null);
});

test('findNode returns null when traversing into a file', () => {
  assert.equal(findNode(fileTree, ['secrets.txt', 'x']), null);
});
