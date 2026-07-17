import React from 'react';
import * as actions from '@xeplr/actions';
import { ActionExplorer, ActionRunner } from '@xeplr/ui-actions';
import '@xeplr/ui-schema-handler/src/styles.css';
import '@xeplr/ui-actions/src/styles.css';
import './App.css';

// Register a few sample actions once, at module load.
actions.clear();

actions.register('greet', {
  description: 'Say hello to someone.',
  inputSchema: [
    { name: 'name',     type: 'string', required: true, order: 1, description: 'Whose day to brighten.' },
    { name: 'shouting', type: 'boolean', order: 2, default: false }
  ],
  execute: async ({ input }) => {
    const msg = 'Hello, ' + input.name + '!';
    return { greeting: input.shouting ? msg.toUpperCase() : msg };
  }
});

actions.register('add', {
  description: 'Add two numbers.',
  inputSchema: [
    { name: 'a', type: 'number', required: true, order: 1 },
    { name: 'b', type: 'number', required: true, order: 2 }
  ],
  execute: async ({ input }) => ({ sum: input.a + input.b })
});

actions.register('slow-echo', {
  description: 'Waits `delayMs` then echoes `message`. Use to test timeouts.',
  inputSchema: [
    { name: 'message', type: 'string',  required: true, order: 1 },
    { name: 'delayMs', type: 'number',  required: true, order: 2, default: 500 }
  ],
  execute: ({ input }) => new Promise(resolve => setTimeout(() => resolve({ echo: input.message }), input.delayMs))
});

actions.register('boom', {
  description: 'Throws — see how the runner captures failures.',
  inputSchema: [
    { name: 'reason', type: 'string', default: 'because we can' }
  ],
  execute: async ({ input }) => { throw new Error('Blew up: ' + input.reason); }
});

const REGISTERED = actions.list();

export default function App() {
  const [selected, setSelected] = React.useState(REGISTERED[0]?.name || null);

  return (
    <div className="app">
      <header>
        <h1>@xeplr/ui-actions</h1>
        <p>Four sample actions registered via <code>actions.register(...)</code>. The explorer (left) shows the runtime registry. The runner (right) uses <code>DynamicForm</code> from <code>@xeplr/ui-schema-handler</code> to render inputs, invokes <code>actions.runAction</code>, and displays the structured result.</p>
      </header>

      <div className="cols">
        <section className="col">
          <h2>ActionExplorer</h2>
          <ActionExplorer
            actions={REGISTERED}
            selected={selected}
            onSelect={setSelected}
          />
        </section>

        <section className="col">
          <h2>ActionRunner</h2>
          <ActionRunner
            actions={REGISTERED}
            initialAction={selected}
            onRun={(name, input) => actions.runAction({ name, input, system: { source: 'demo' }, timeoutMs: 5000 })}
          />
        </section>
      </div>
    </div>
  );
}
