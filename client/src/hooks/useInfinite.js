import { useCallback, useEffect, useRef, useState } from 'react';
import api, { errMsg } from '../lib/api.js';

// Cuộn xuống để tải thêm (IntersectionObserver). Đổi tham số hoặc gọi reload() thì tải lại từ trang 1.
export default function useInfinite(path, params, limit = 20) {
  const [items, setItems] = useState([]); const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const sentinelRef = useRef(null);
  const key = JSON.stringify([params, tick]);
  useEffect(() => { setItems([]); setTotal(0); setPage(1); }, [key]);
  useEffect(() => {
    const ac = new AbortController();
    setLoading(true); setError('');
    api.get(`/${path}`, { params: { ...params, page, limit }, signal: ac.signal })
      .then((r) => { setTotal(r.data.total); setItems((prev) => (page === 1 ? r.data.rows : [...prev, ...r.data.rows])); setLoading(false); })
      .catch((e) => { if (e.code !== 'ERR_CANCELED') { setError(errMsg(e)); setLoading(false); } });
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key, page, limit]);
  const reload = useCallback(() => setTick((x) => x + 1), []);
  const hasMore = items.length < total;
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setPage((n) => n + 1); }, { rootMargin: '400px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, items.length]);
  return { items, total, loading, error, hasMore, sentinelRef, reload };
}
