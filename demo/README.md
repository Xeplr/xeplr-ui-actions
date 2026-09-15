# @xeplr/ui-actions — demo

A local playground for [`@xeplr/ui-actions`](../README.md) with four sample actions — `greet`, `add`, `slow-echo` and `boom` (which throws) — so the runner's form, progress, result and error states can all be seen.

```sh
npm install
npm run dev     # http://localhost:5274
```

It links sibling checkouts (`file:../../xeplr-actions`, `file:../../xeplr-schema-handler`, `file:../../xeplr-ui-schema-handler`, `file:..`), so run it from inside the xeplr-os workspace. Not published.

| file | |
|---|---|
| `src/App.jsx` | the sample actions and the runner |
| `src/App.css` | its styles |
| `vite.config.js` | Vite + React, resolving the linked packages |
