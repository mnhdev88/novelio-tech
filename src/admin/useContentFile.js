// Load one content file, edit it, autosave it as a draft.
//
// Every settings-style screen in the panel is the same shape — fetch JSON, let
// the client change fields, save quietly — so that behaviour lives here once.

import { useState, useEffect, useRef, useCallback } from 'react';
import * as api from './api';
import { useAdmin } from './AdminContext';

const AUTOSAVE_MS = 1200;

export default function useContentFile(path) {
  const { refreshPending } = useAdmin();
  const [data, setData] = useState(null);
  const [baseSha, setBaseSha] = useState(null);
  const [error, setError] = useState(null);
  const [state, setState] = useState('loading');   // loading | idle | saving | saved
  const timer = useRef(null);

  useEffect(() => {
    let cancelled = false;
    api.content.get(path)
      .then((res) => {
        if (cancelled) return;
        setData(res.payload);
        setBaseSha(res.base_sha);
        setState('idle');
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e.message);
        setState('idle');
      });
    return () => { cancelled = true; clearTimeout(timer.current); };
  }, [path]);

  const save = useCallback(async (next) => {
    setState('saving');
    try {
      await api.content.save(path, next, baseSha);
      setState('saved');
      setError(null);
      refreshPending();
    } catch (e) {
      setError(e.message);
      setState('idle');
    }
  }, [path, baseSha, refreshPending]);

  /** Replace the whole document and queue a save. */
  const update = useCallback((next) => {
    setData(next);
    setState('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(next), AUTOSAVE_MS);
  }, [save]);

  return { data, update, state, error, setError };
}
