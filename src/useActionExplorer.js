import { useCallback, useMemo, useRef } from 'react';
import { useUrlState } from '@xeplr/ui-utils/src/url/useUrlState.js';
import { explorerUrlKey, encodeOpen, decodeOpen, toggleOpen } from './explorerUrlState.js';

/**
 * Which of the explorer's cards are open. In the URL (`<urlKey>Open`) when the
 * host gives a `urlKey`, in memory otherwise. Opening or closing a card adds a
 * history entry, so Back closes it again.
 *
 *   const { isOpen, toggle } = useActionExplorer({ urlKey: 'actions' })
 */
export function useActionExplorer({ urlKey } = {}) {
  const key = explorerUrlKey(urlKey);
  const [value, setValue] = useUrlState(key || 'open', { inUrl: Boolean(key) });
  const open = useMemo(() => decodeOpen(value), [value]);
  // Two toggles in one event build on each other.
  const openRef = useRef(open); openRef.current = open;
  const isOpen = useCallback((name) => open.includes(name), [open]);
  const toggle = useCallback((name) => {
    const next = toggleOpen(openRef.current, name);
    openRef.current = next;
    setValue(encodeOpen(next));
  }, [setValue]);
  return { open, isOpen, toggle };
}
