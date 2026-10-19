// Which explorer cards are open, in the URL: the value format, and the
// controller reading it back from a real react-router MemoryRouter and being
// toggled in memory, rendered with react-dom/server.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { explorerUrlKey, encodeOpen, decodeOpen, toggleOpen } from '../src/explorerUrlState.js';
import { useActionExplorer } from '../src/useActionExplorer.js';

test('the key is the host\'s; none means in memory', () => {
  assert.equal(explorerUrlKey('actions'), 'actionsOpen');
  assert.equal(explorerUrlKey(undefined), null);
  assert.equal(explorerUrlKey(''), null);
});

test('open names round-trip, a comma inside a name included', () => {
  const names = ['send.email', 'a,b', 'ünï code'];
  assert.deepEqual(decodeOpen(encodeOpen(names)), names);
});

test('nothing open is no value; empty and unreadable parts are dropped', () => {
  assert.equal(encodeOpen([]), null);
  assert.equal(encodeOpen(undefined), null);
  assert.equal(encodeOpen(['', null]), null);
  assert.deepEqual(decodeOpen(null), []);
  assert.deepEqual(decodeOpen('a,,%E0%A4%A,b'), ['a', 'b']);
});

test('toggling opens a closed card and closes an open one', () => {
  assert.deepEqual(toggleOpen(['a'], 'b'), ['a', 'b']);
  assert.deepEqual(toggleOpen(['a', 'b'], 'a'), ['b']);
  assert.deepEqual(toggleOpen(undefined, 'a'), ['a']);
});

function at(url, options) {
  let seen = null;
  function Probe() { seen = useActionExplorer(options); return null; }
  renderToString(createElement(MemoryRouter, { initialEntries: [url] }, createElement(Probe)));
  return seen;
}

test('a link opens the cards it names, under the host\'s key only', () => {
  const c = at('/?actionsOpen=add,send.email', { urlKey: 'actions' });
  assert.equal(c.isOpen('add'), true);
  assert.equal(c.isOpen('send.email'), true);
  assert.equal(c.isOpen('other'), false);
  assert.deepEqual(at('/?actionsOpen=add', { urlKey: 'tools' }).open, []);
  assert.deepEqual(at('/?open=add').open, [], 'without urlKey the URL is not read');
});

test('toggles, one per click, in memory', () => {
  const log = [];
  const clicks = [(c) => c.toggle('add'), (c) => c.toggle('sub'), (c) => c.toggle('add')];
  let i = 0;
  function Probe() {
    const c = useActionExplorer();
    if (i > 0) log.push(c.open);
    if (i < clicks.length) clicks[i++](c);
    return null;
  }
  renderToString(createElement(MemoryRouter, null, createElement(Probe)));
  assert.deepEqual(log, [['add'], ['add', 'sub'], ['sub']]);
});
