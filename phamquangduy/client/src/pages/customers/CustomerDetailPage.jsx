import { Link, useParams } from 'react-router-dom';
import Badge from '../../components/Badge.jsx';
import Loading from '../../components/Loading.jsx';
import useFetch from '../../hooks/useFetch.js';
import { date, money } from '../../lib/format.js';

const Row = ({ l, children }) => <div className="flex justify-between gap-4 border-b py-2 text-sm dark:border-slate-700"><span className="text-slate-500">{l}</span><span>{children}</span></div>;

export default function CustomerDetailPage() {
  const { id } = useParams(); const { data: c, error } = useFetch(`/customers/${id}`);
  if (!c) return <Loading error={error} />;
  return (
    <div className="space-y-3"><Link to="/customers" className="text-sm text-blue-600">← Khách hàng</Link>
      <section className="card max-w-xl"><h1 className="mb-2 text-xl font-bold">{c.name}</h1>
        <Row l="Mã">{c.code}</Row><Row l="Email">{c.email}</Row><Row l="Điện thoại">{c.phone || '—'}</Row><Row l="Địa chỉ">{c.address || '—'}</Row><Row l="Trạng thái"><Badge s={c.status} /></Row></section>
      <section className="card max-w-xl overflow-x-auto"><h2 className="mb-2 font-semibold">Lịch sử đơn hàng ({c.orders.length})</h2>
        <table className="w-full text-sm"><tbody>{c.orders.map((o) => <tr key={o.id} className="border-t dark:border-slate-700"><td className="py-1"><Link className="text-blue-600" to={`/orders/${o.id}`}>{o.code}</Link></td><td>{date(o.created_at)}</td><td>{money(o.total)}</td><td><Badge s={o.status} /></td></tr>)}</tbody></table></section>
    </div>
  );
}
