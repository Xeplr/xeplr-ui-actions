# @xeplr/ui-actions

**React components for an [`@xeplr/actions`](https://www.npmjs.com/package/@xeplr/actions) registry.** `<ActionExplorer>` lists registered actions and expands each one into tables of its input and output schema. `<ActionRunner>` is a "try this action" panel: pick an action, fill its inputs, press Run, and see the result, whether it succeeded or failed. The input form is `DynamicForm` from [`@xeplr/ui-schema-handler`](https://www.npmjs.com/package/@xeplr/ui-schema-handler). Neither component imports `@xeplr/actions`. They take the plain shape its `list()` returns, and the runner calls whatever `onRun` you give it.

(The package name on npm is `@xeplr/ui-actions`. The GitHub repo and folder are named `xeplr-ui-actions`.)

## Install

```sh
npm i @xeplr/ui-actions @xeplr/ui-schema-handler @xeplr/schema-handler @xeplr/actions
```

Peer dependencies: `react ^18 || ^19`, `@xeplr/actions ^1`, and `@xeplr/ui-schema-handler ^1` (which needs `@xeplr/schema-handler ^1`).

The package ships its source (`main: src/index.js`, JSX included), so your bundler must compile JSX from `node_modules`. Vite does this. The demo also lists the CommonJS `@xeplr/*` packages in Vite's `optimizeDeps.include` and `resolve.alias`, so their nested `require`s resolve.

Both stylesheets are opt-in. The runner's form uses the schema-handler classes, so import both for the default look:

```js
import '@xeplr/ui-schema-handler/src/styles.css'
import '@xeplr/ui-actions/src/styles.css'
```

## Quick start

From `demo/src/App.jsx`:

```jsx
import * as actions from '@xeplr/actions'
import { ActionExplorer, ActionRunner } from '@xeplr/ui-actions'
import '@xeplr/ui-schema-handler/src/styles.css'
import '@xeplr/ui-actions/src/styles.css'

actions.register('add', {
  description: 'Add two numbers.',
  inputSchema: [
    { name: 'a', type: 'number', required: true, order: 1 },
    { name: 'b', type: 'number', required: true, order: 2 }
  ],
  execute: async ({ input }) => ({ sum: input.a + input.b })
})

const REGISTERED = actions.list()

export default function App() {
  return (
    <>
      <ActionExplorer actions={REGISTERED} />
      <ActionRunner
        actions={REGISTERED}
        onRun={(name, input) => actions.runAction({ name, input, system: { source: 'demo' }, timeoutMs: 5000 })}
      />
    </>
  )
}
```

`runAction` never throws. It resolves to `{ status: 'success' | 'failed', output, error, durationMs }`, which is the shape `ActionRunner` displays. If the actions run on a server, `onRun` can make a network call instead, as long as it resolves to the same shape.

## Exports

| export | kind | props | what it does |
|---|---|---|---|
| `ActionExplorer` | component | `{ actions, onSelect, selected }` | One card per action. Clicking a card opens its Inputs/Outputs schema tables. |
| `ActionRunner` | component | `{ actions, onRun, initialAction }` | Action picker, an input form (`DynamicForm`), Run / Reset buttons, and a result panel |

There are no hooks and no model module. The package has just these two components.

## `<ActionExplorer>`

| prop | type | default | meaning |
|---|---|---|---|
| `actions` | `Array<{ name, description?, inputSchema?, outputSchema? }>` | `[]` | For example `actions.list()`. Cards are keyed by `name`. |
| `onSelect` | `(name) => void` | — | Called when a card header is clicked |
| `selected` | `string` | — | Name of the card to highlight (`xeplr-ax-card--selected`) |

- A card always shows its name and `description`. Clicking the header toggles it open and calls `onSelect` in the same click.
- An open card shows an **Inputs** table and, only if the action has an `outputSchema`, an **Outputs** table. The columns are Name, Type (default `string`), Req (●), Default (JSON) and Description, sorted by `order`. An empty or missing input schema reads "Inputs: *none*".
- With no actions it shows "No actions registered."

## `<ActionRunner>`

| prop | type | default | meaning |
|---|---|---|---|
| `actions` | `Array<{ name, description?, inputSchema? }>` | `[]` | Actions in the picker |
| `onRun` | `(name, input) => Promise<{ status, output?, error?, durationMs? }>` | — | Runs the action. Without it, Run does nothing. |
| `initialAction` | `string` | first action | The action selected **when the component mounts** |

- **`initialAction` is read once.** Changing it later does not change the picker. To make the runner follow a selection elsewhere, such as `ActionExplorer`'s `selected`, remount it with `key={selected}`.
- **Switching actions clears the input and the last result.** Values typed for one schema are never sent to another.
- The inputs come from `DynamicForm` with the action's `inputSchema`. It is disabled while a run is in progress. The component does no validation before calling `onRun`. `runAction` does that, and a validation failure comes back as a `failed` result.
- **Run** shows "Running…" and is disabled until `onRun` settles. **Reset** clears the input and result.
- If `onRun` throws, the result becomes `{ status: 'failed', error: { name, message }, durationMs: 0 }`.

The result panel:

| `status` | shows |
|---|---|
| `success` | "✓ success", `durationMs` if it is a number, and `output` as pretty JSON |
| anything else (`failed`, `skipped`, …) | "✗ status", then `error.name: error.message`, and `error.details` as a bulleted list |

**`error.details` is rendered directly as list items, so each entry must be a string.** A `ValidationError` from the current `@xeplr/schema-handler` has `details` as `{ field, message }` objects, and `runAction` passes them through. React cannot render those objects. Until the runner handles them, flatten them in `onRun`:

```jsx
<ActionRunner
  actions={REGISTERED}
  onRun={async (name, input) => {
    const r = await actions.runAction({ name, input, timeoutMs: 5000 })
    if (r.error && Array.isArray(r.error.details)) {
      r.error.details = r.error.details.map((d) => (typeof d === 'string' ? d : d.message))
    }
    return r
  }}
/>
```

## Theming

The stylesheet has no CSS variables and does not read the `--xeplr-*` tokens from `@xeplr/ui-account`'s `ThemeProvider`. Its colours are fixed and light. Every rule uses the `xeplr-ax-*` prefix, so you can override it easily or leave it out.

| component | classes |
|---|---|
| `ActionExplorer` | `xeplr-ax-explorer`, `xeplr-ax-empty`, `xeplr-ax-card`, `xeplr-ax-card--selected`, `xeplr-ax-card-hd`, `xeplr-ax-name`, `xeplr-ax-hint`, `xeplr-ax-desc`, `xeplr-ax-body`, `xeplr-ax-schema-title`, `xeplr-ax-schema-empty`, `xeplr-ax-schema-tbl` |
| `ActionRunner` | `xeplr-ax-runner`, `xeplr-ax-runner-row`, `xeplr-ax-runner-lbl`, `xeplr-ax-runner-select`, `xeplr-ax-runner-desc`, `xeplr-ax-runner-form`, `xeplr-ax-runner-actions`, `xeplr-ax-primary` |
| result panel | `xeplr-ax-result`, `xeplr-ax-result--success` / `--failed` / `--skipped`, `xeplr-ax-result-hd`, `xeplr-ax-result-dur`, `xeplr-ax-result-body`, `xeplr-ax-result-err-title`, `xeplr-ax-result-err-details` |

The form inside the runner uses `xeplr-shf-*` classes from `@xeplr/ui-schema-handler`.

## Try it

The demo links sibling checkouts (`../../xeplr-actions`, `../../xeplr-schema-handler`, `../../xeplr-ui-schema-handler`), so run it from inside the xeplr-os workspace:

```sh
cd demo
npm install
npm run dev     # http://localhost:5274 — four sample actions: greet, add, slow-echo, boom (throws)
```

## Files

```
src/
  index.js            ─ exports ActionExplorer, ActionRunner
  ActionExplorer.jsx  ─ cards + input/output schema tables
  ActionRunner.jsx    ─ picker, DynamicForm inputs, run, result panel
  styles.css          ─ optional default styles, xeplr-ax-*
demo/                 ─ Vite app (not published)
```

## Tests

There is no test suite. `package.json` has no `test` script, so CI and the release workflow only log a "nothing verified" warning.

## License

MIT
