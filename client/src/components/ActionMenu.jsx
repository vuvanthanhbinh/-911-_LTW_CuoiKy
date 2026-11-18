import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import useClickOutside from '../hooks/useClickOutside.js';

// Icon "i" đỏ: bấm vào mới hiện các thao tác. items: [{ label, onClick, danger?, hidden? }]
// Menu vẽ qua portal + position fixed để không bị bảng (overflow) hoặc thẻ (transform) che/cắt.
export default function ActionMenu({ items }) {
  const [pos, setPos] = useState(null); const btn = useRef(null); const menu = useRef(null);
  const shown = items.filter((i) => !i.hidden);
  const close = () => setPos(null);
  useClickOutside([btn, menu], close);
  useEffect(() => {
    if (!pos) return undefined;
    window.addEventListener('scroll', close, true); window.addEventListener('resize', close);
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close); };
  }, [pos]);
  if (!shown.length) return null;
  const toggle = () => {
    if (pos) return close();
    const r = btn.current.getBoundingClientRect();
    const below = window.innerHeight - r.bottom > shown.length * 38 + 16;
    return setPos({ right: window.innerWidth - r.right, ...(below ? { top: r.bottom + 4 } : { bottom: window.innerHeight - r.top + 4 }) });
  };
  return (
    <>
      <button ref={btn} type="button" aria-label="Thao tác" aria-haspopup="menu" aria-expanded={!!pos} onClick={toggle} className="rounded-full p-1 text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-slate-700"><Info size={18} /></button>
      {pos && createPortal(
        <div ref={menu} role="menu" style={{ position: 'fixed', ...pos }} className="page z-50 w-48 rounded-lg border bg-white py-1 text-sm shadow-lg dark:border-slate-600 dark:bg-slate-800">
          {shown.map((i) => <button key={i.label} role="menuitem" onClick={() => { close(); i.onClick(); }} className={`block w-full px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${i.danger ? 'text-red-500' : ''}`}>{i.label}</button>)}
        </div>, document.body)}
    </>
  );
}
