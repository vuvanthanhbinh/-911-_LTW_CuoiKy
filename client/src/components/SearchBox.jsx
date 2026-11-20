import { useEffect, useRef, useState } from 'react';
import api from '../lib/api.js';
import useClickOutside from '../hooks/useClickOutside.js';
import useDebounce from '../hooks/useDebounce.js';

const Highlight = ({ text, q }) => {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0 || !q) return text;
  return <>{text.slice(0, i)}<mark className="bg-transparent font-bold text-blue-600">{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
};

// Ô tìm kiếm có gợi ý nhanh: gõ từng chữ là hiện danh sách sản phẩm khớp (↑ ↓ Enter Esc)
export default function SearchBox({ value, onChange, onSubmit, onPick, placeholder = 'Tìm sản phẩm…', className = '' }) {
  const [open, setOpen] = useState(false); const [list, setList] = useState([]); const [hi, setHi] = useState(-1);
  const ref = useRef(null); const dq = useDebounce(value, 150);
  useClickOutside([ref], () => setOpen(false));
  useEffect(() => {
    const q = dq.trim();
    if (!q) { setList([]); return undefined; }
    const ac = new AbortController();
    api.get('/suggest', { params: { q }, signal: ac.signal }).then((r) => { setList(r.data); setHi(-1); }).catch(() => {});
    return () => ac.abort();
  }, [dq]);
  const pick = (p) => { setOpen(false); onPick(p); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHi((h) => Math.min(h + 1, list.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(h - 1, -1)); }
    else if (e.key === 'Escape') setOpen(false);
    else if (e.key === 'Enter') { e.preventDefault(); if (open && hi >= 0 && list[hi]) pick(list[hi]); else { setOpen(false); onSubmit?.(value); } }
  };
  const show = open && value.trim() && list.length > 0;
  return (
    <div ref={ref} className={`relative ${className}`}>
      <input role="combobox" aria-expanded={!!show} aria-autocomplete="list" aria-label="Tìm sản phẩm" value={value} placeholder={placeholder} autoComplete="off"
        onChange={(e) => { onChange(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onKey}
        className="w-full rounded border px-2 py-1.5 text-sm transition-colors dark:border-slate-600 dark:bg-slate-700" />
      {show && (
        <ul role="listbox" className="page absolute left-0 right-0 z-30 mt-1 overflow-hidden rounded-lg border bg-white text-sm shadow-lg dark:border-slate-600 dark:bg-slate-800">
          {list.map((p, i) => (
            <li key={p.id} role="option" aria-selected={i === hi}>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); pick(p); }} onMouseEnter={() => setHi(i)} className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left ${i === hi ? 'bg-blue-50 dark:bg-slate-700' : ''}`}>
                <span className="truncate"><Highlight text={p.name} q={value.trim()} /></span><span className="shrink-0 text-xs text-slate-400">{p.sku}</span>
              </button>
            </li>))}
        </ul>)}
    </div>
  );
}
