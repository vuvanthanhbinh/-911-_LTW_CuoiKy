import { memo, useState } from 'react';
import { Package } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ActionMenu from '../../components/ActionMenu.jsx';
import Badge from '../../components/Badge.jsx';
import { money } from '../../lib/format.js';

// Thẻ sản phẩm: ảnh (link để trống thì hiện icon), thông tin, menu thao tác chữ "i" đỏ
export default memo(function ProductCard({ p, isAdmin, onEdit, onDelete }) {
  const nav = useNavigate(); const [bad, setBad] = useState(false);
  const items = [
    { label: 'Xem chi tiết', onClick: () => nav(`/products/${p.id}`) },
    { label: 'Sửa', onClick: () => onEdit(p) },
    { label: 'Xóa', danger: true, hidden: !isAdmin, onClick: () => onDelete(p) },
  ];
  return (
    <article className="group overflow-hidden rounded-xl bg-white shadow-sm transition-shadow duration-200 hover:shadow-md dark:bg-slate-800">
      <div className="relative aspect-square bg-slate-100 dark:bg-slate-700">
        {p.image_url && !bad
          ? <img src={p.image_url} alt={p.name} loading="lazy" onError={() => setBad(true)} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          : <div className="grid h-full place-items-center text-slate-300 dark:text-slate-500"><Package size={44} /></div>}
        <div className="absolute right-2 top-2 rounded-full bg-white/90 dark:bg-slate-800/90"><ActionMenu items={items} /></div>
      </div>
      <div className="space-y-1 p-3">
        <p className="truncate text-xs text-slate-500">{p.category} · {p.sku}</p>
        <Link to={`/products/${p.id}`} className="block truncate font-semibold hover:text-blue-600" title={p.name}>{p.name}</Link>
        <p className="font-bold text-blue-600">{money(p.price)}</p>
        <div className="flex items-center justify-between text-xs"><span className={p.stock < 10 ? 'font-semibold text-red-500' : 'text-slate-500'}>Kho: {p.stock}</span><Badge s={p.status} /></div>
      </div>
    </article>
  );
});
