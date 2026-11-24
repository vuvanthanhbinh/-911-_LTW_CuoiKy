import { Package } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Badge from '../../components/Badge.jsx';
import Loading from '../../components/Loading.jsx';
import useFetch from '../../hooks/useFetch.js';
import { money } from '../../lib/format.js';

const Row = ({ l, children }) => <div className="flex justify-between gap-4 border-b py-2 text-sm dark:border-slate-700"><span className="text-slate-500">{l}</span><span className="text-right">{children}</span></div>;

export default function ProductDetailPage() {
  const { id } = useParams(); const { data: p, error } = useFetch(`/products/${id}`);
  if (!p) return <Loading error={error} />;
  return (
    <div className="space-y-3"><Link to="/products" className="text-sm text-blue-600">← Sản phẩm</Link>
      <div className="grid max-w-3xl gap-4 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700">
          {p.image_url ? <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-300"><Package size={64} /></div>}
        </div>
        <section className="card"><h1 className="mb-2 text-xl font-bold">{p.name}</h1>
          <Row l="Mã SKU">{p.sku}</Row><Row l="Danh mục">{p.category}</Row><Row l="Giá bán">{money(p.price)}</Row><Row l="Tồn kho">{p.stock}</Row><Row l="Trạng thái"><Badge s={p.status} /></Row><Row l="Mô tả">{p.description || '—'}</Row></section>
      </div>
    </div>
  );
}
