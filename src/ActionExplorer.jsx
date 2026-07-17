import React from 'react';

/**
 * List actions from the registry. Click one to expand its input/output schema.
 *
 * Props:
 *   actions   — [{name, description, inputSchema, outputSchema}] (e.g. from actions.list())
 *   onSelect(name)   — optional callback when an action is clicked
 *   selected  — name of currently-selected action (for highlighting)
 */
export function ActionExplorer({ actions = [], onSelect, selected }) {
  return (
    <div className="xeplr-ax-explorer">
      {actions.length === 0 && (
        <div className="xeplr-ax-empty">No actions registered.</div>
      )}
      {actions.map(a => (
        <ActionCard
          key={a.name}
          action={a}
          selected={selected === a.name}
          onClick={() => onSelect && onSelect(a.name)}
        />
      ))}
    </div>
  );
}

function ActionCard({ action, selected, onClick }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={`xeplr-ax-card${selected ? ' xeplr-ax-card--selected' : ''}`}>
      <div className="xeplr-ax-card-hd" onClick={() => { setOpen(!open); onClick && onClick(); }}>
        <span className="xeplr-ax-name">{action.name}</span>
        <span className="xeplr-ax-hint">{open ? '▾' : '▸'}</span>
      </div>
      {action.description && <div className="xeplr-ax-desc">{action.description}</div>}
      {open && (
        <div className="xeplr-ax-body">
          <SchemaTable title="Inputs"  fields={action.inputSchema} />
          {action.outputSchema && <SchemaTable title="Outputs" fields={action.outputSchema} />}
        </div>
      )}
    </div>
  );
}

function SchemaTable({ title, fields }) {
  if (!Array.isArray(fields) || fields.length === 0) {
    return <div className="xeplr-ax-schema-empty">{title}: <em>none</em></div>;
  }
  const sorted = [...fields].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  return (
    <div>
      <div className="xeplr-ax-schema-title">{title}</div>
      <table className="xeplr-ax-schema-tbl">
        <thead>
          <tr><th>Name</th><th>Type</th><th>Req</th><th>Default</th><th>Description</th></tr>
        </thead>
        <tbody>
          {sorted.map(f => (
            <tr key={f.name}>
              <td><code>{f.name}</code></td>
              <td>{f.type || 'string'}</td>
              <td>{f.required ? '●' : ''}</td>
              <td>{f.default === undefined ? '' : JSON.stringify(f.default)}</td>
              <td>{f.description || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
