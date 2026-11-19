import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useDebounce from './useDebounce.js';
import useFetch from './useFetch.js';

// Trạng thái danh sách dạng bảng: tìm kiếm (debounce), lọc, sắp xếp, phân trang — xử lý ở server
export default function useListQuery(path, limit = 8) {
  const [sp] = useSearchParams(); const initQ = sp.get('q') || '';
  const [p, setP] = useState({ page: 1, q: initQ, status: '', sort: 'id', dir: 'desc' });
  const [qq, setQq] = useState(initQ); const [tick, setTick] = useState(0);
  const dq = useDebounce(qq, 300);
  useEffect(() => { setQq(initQ); }, [initQ]);
  useEffect(() => { setP((s) => (s.q === dq ? s : { ...s, q: dq, page: 1 })); }, [dq]);
  const { data, error, loading } = useFetch(`/${path}`, { ...p, limit, tick });
  const reload = useCallback(() => setTick((x) => x + 1), []);
  const sortBy = useCallback((k) => setP((s) => ({ ...s, sort: k, dir: s.sort === k && s.dir === 'desc' ? 'asc' : 'desc' })), []);
  const setPage = useCallback((page) => setP((s) => ({ ...s, page })), []);
  const setStatus = useCallback((status) => setP((s) => ({ ...s, status, page: 1 })), []);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;
  return { p, qq, setQq, data, error, loading, reload, sortBy, setPage, setStatus, pages };
}
