// Reorderable list of menu links, shared by the header and footer editors.
//
// Editing a menu is index arithmetic, and writing it twice would be two chances
// to get the move/remove maths wrong.

import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { inputCls } from './ui';

export default function LinkList({ items, onChange, allowHref, addLabel }) {
  const set = (i, patch) => onChange(items.map((it, j) => (j === i ? { ...it, ...patch } : it)));

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col">
            <button onClick={() => move(i, -1)} disabled={i === 0}
              className="p-0.5 text-[#cbd5e1] hover:text-[#1B3172] disabled:opacity-30 cursor-pointer" aria-label="Move up">
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => move(i, 1)} disabled={i === items.length - 1}
              className="p-0.5 text-[#cbd5e1] hover:text-[#1B3172] disabled:opacity-30 cursor-pointer" aria-label="Move down">
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <input
            value={item.label} onChange={(e) => set(i, { label: e.target.value })}
            placeholder="Menu text" className={`${inputCls} flex-1`}
          />
          <input
            // An entry with `href` points at a file or another site; everything
            // else is an in-app route. Keep whichever kind this one already is.
            value={item.href ?? item.to ?? ''}
            onChange={(e) => set(i, allowHref && item.href !== undefined
              ? { href: e.target.value }
              : { to: e.target.value })}
            placeholder="/page" className={`${inputCls} flex-1 font-mono text-xs`}
          />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="p-2 text-[#94a3b8] hover:text-red-600 cursor-pointer" aria-label="Remove link">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      <button
        onClick={() => onChange([...items, { label: 'New link', to: '/' }])}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-xs font-semibold text-[#64748b] hover:border-[#1B3172] hover:text-[#1B3172] cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" /> {addLabel || 'Add link'}
      </button>
    </div>
  );
}
