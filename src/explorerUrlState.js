// Which action cards are open lives in the URL — the pure half, no React.
//
// An open card is a place: the schema someone was reading. With a host-given
// `urlKey`, the open cards' names are written to `<urlKey>Open`, so a refresh
// or a shared link opens them again. Without one they stay in memory: a page
// may hold two explorers, and the host app has keys of its own.

/** The query key for a host's `urlKey`, or null (in memory). */
export function explorerUrlKey(urlKey) {
  return urlKey ? urlKey + 'Open' : null;
}

/**
 * Open card names → one query value: comma-separated, each URI-encoded so a
 * name holding a comma splits back exactly. None open → null (no key).
 */
export function encodeOpen(names) {
  const list = (names || []).filter((n) => n !== null && n !== undefined && n !== '');
  return list.length ? list.map((n) => encodeURIComponent(String(n))).join(',') : null;
}

/** The query value back to the open names; unreadable ones are dropped. */
export function decodeOpen(value) {
  if (!value || typeof value !== 'string') return [];
  const out = [];
  value.split(',').forEach((part) => {
    if (!part) return;
    try { out.push(decodeURIComponent(part)); } catch { /* not a name */ }
  });
  return out;
}

/** The open names with `name` opened, or closed if it was open. */
export function toggleOpen(names, name) {
  const list = names || [];
  return list.includes(name) ? list.filter((n) => n !== name) : list.concat([name]);
}
