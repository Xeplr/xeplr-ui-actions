import React from 'react';
import { DynamicForm } from '@xeplr/ui-schema-handler';

/**
 * "Try this action" playground. Pick an action, fill inputs, invoke, see result.
 *
 * Props:
 *   actions        — [{name, description, inputSchema, outputSchema}]
 *   onRun(name, input) => Promise<{status, output, error, durationMs}>
 *                    Typically bound to actions.runAction from @xeplr/actions,
 *                    or a network call if invoking on a remote scheduler.
 *   initialAction  — optional action name to preselect
 */
export function ActionRunner({ actions = [], onRun, initialAction = null }) {
  const [name, setName]     = React.useState(initialAction || (actions[0] && actions[0].name) || '');
  const [input, setInput]   = React.useState({});
  const [busy, setBusy]     = React.useState(false);
  const [result, setResult] = React.useState(null);

  // Reset input when switching actions.
  React.useEffect(() => { setInput({}); setResult(null); }, [name]);

  const action = actions.find(a => a.name === name);

  const run = async () => {
    if (!onRun) return;
    setBusy(true); setResult(null);
    try {
      const r = await onRun(name, input);
      setResult(r);
    } catch (err) {
      setResult({ status: 'failed', error: { name: err.name, message: err.message }, durationMs: 0 });
    } finally { setBusy(false); }
  };

  return (
    <div className="xeplr-ax-runner">
      <div className="xeplr-ax-runner-row">
        <label>
          <span className="xeplr-ax-runner-lbl">Action</span>
          <select
            className="xeplr-ax-runner-select"
            value={name}
            onChange={(e) => setName(e.target.value)}
          >
            {actions.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
          </select>
        </label>
      </div>

      {action && (
        <>
          {action.description && <div className="xeplr-ax-runner-desc">{action.description}</div>}

          <div className="xeplr-ax-runner-form">
            <div className="xeplr-ax-runner-lbl">Inputs</div>
            <DynamicForm
              schema={action.inputSchema || []}
              value={input}
              onChange={setInput}
              disabled={busy}
            />
          </div>

          <div className="xeplr-ax-runner-actions">
            <button className="xeplr-ax-primary" onClick={run} disabled={busy}>
              {busy ? 'Running…' : 'Run'}
            </button>
            <button onClick={() => { setInput({}); setResult(null); }} disabled={busy}>Reset</button>
          </div>

          {result && <ResultPanel result={result} />}
        </>
      )}
    </div>
  );
}

function ResultPanel({ result }) {
  const cls = 'xeplr-ax-result xeplr-ax-result--' + result.status;
  return (
    <div className={cls}>
      <div className="xeplr-ax-result-hd">
        <span>{result.status === 'success' ? '✓' : '✗'} {result.status}</span>
        {typeof result.durationMs === 'number' && (
          <span className="xeplr-ax-result-dur">{result.durationMs}ms</span>
        )}
      </div>
      {result.status === 'success' && (
        <pre className="xeplr-ax-result-body">{safeJson(result.output)}</pre>
      )}
      {result.status !== 'success' && result.error && (
        <>
          <div className="xeplr-ax-result-err-title">{result.error.name || 'Error'}: {result.error.message}</div>
          {Array.isArray(result.error.details) && result.error.details.length > 0 && (
            <ul className="xeplr-ax-result-err-details">
              {result.error.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function safeJson(v) {
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}
