import { useEffect, useRef } from 'react';

// Gọi handler khi bấm ra ngoài tất cả các ref (chỉ khi các ref đang gắn vào DOM)
export default function useClickOutside(refs, handler) {
  const h = useRef(handler);
  h.current = handler;
  useEffect(() => {
    const onDown = (e) => { if (refs.every((r) => r.current && !r.current.contains(e.target))) h.current(e); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
