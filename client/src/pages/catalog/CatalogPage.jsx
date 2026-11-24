import { useState } from 'react';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading.jsx';
import useDebounce from '../../hooks/useDebounce.js';
import useFetch from '../../hooks/useFetch.js';
import { money } from '../../lib/format.js';

// Trang công khai: chỉ sản phẩm Active
export default function CatalogPage() {
  const [q, setQ] = useState(''); const dq = useDebounce(q, 300);
  const { data, error } = useFetch('/catalog', { q: dq });
  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4">
      <header className="flex items-center justify-between"><h1 className="text-xl font-bold text-blue-600">AdminPanel · Cửa hàng</h1><Link to="/login" className="text-sm text-blue-600">Đăng nhập</Link></header>
      <input aria-label="Tìm sản phẩm" placeholder="Tìm sản phẩm…" value={q} onChange={(e) => setQ(e.target.value)} className="w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-800" />
      <main>{!data ? <Loading error={error} /> : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">{data.map((p) => (
          <article key={p.id} className="overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md dark:bg-slate-800">
            <div className="aspect-square bg-slate-100 dark:bg-slate-700">{p.image_url ? <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-300"><Package size={40} /></div>}</div>
            <div className="space-y-1 p-3"><p className="text-xs text-slate-500">{p.category}</p><h2 className="truncate font-semibold">{p.name}</h2><p className="font-bold text-blue-600">{money(p.price)}</p><p className={`text-xs ${p.in_stock ? 'text-green-600' : 'text-red-500'}`}>{p.in_stock ? 'Còn hàng' : 'Hết hàng'}</p></div>
          </article>))}</div>)}</main>
    </div>
  );
}
