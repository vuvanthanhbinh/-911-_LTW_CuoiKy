import { Link, useParams } from 'react-router-dom';
import Badge from '../../components/Badge.jsx';
import Loading from '../../components/Loading.jsx';
import useFetch from '../../hooks/useFetch.js';
import { date, dateTime, money } from '../../lib/format.js';
import { PAYMENT } from '../../lib/labels.js';

const Row = ({ l, children }) => <div className="flex justify-between gap-4 border-b py-2 text-sm dark:border-slate-700"><span className="text-slate-500">{l}</span><span>{children}</span></div>;

export default function OrderDetailPage() {
  const { id } = useParams(); const { data: o, error } = useFetch(`/orders/${id}`);
  if (!o) return <Loading error={error} />;
  return (
    <div className="space-y-3"><Link to="/orders" className="text-sm text-blue-600">← Đơn hàng</Link>
      <section className="card max-w-2xl"><h1 className="mb-2 text-xl font-bold">Đơn {o.code}</h1>
        <Row l="Khách hàng"><Link className="text-blue-600" to={`/customers/${o.customer_id}`}>{o.customer}</Link></Row><Row l="Ngày đặt">{date(o.created_at)}</Row>
        <Row l="Thanh toán">{PAYMENT[o.payment_method]}</Row><Row l="Trạng thái"><Badge s={o.status} /></Row><Row l="Ghi chú">{o.note || '—'}</Row></section>
      <section className="card max-w-2xl overflow-x-auto"><h2 className="mb-2 font-semibold">Sản phẩm (giá tại thời điểm đặt)</h2>
        <table className="w-full text-sm"><thead><tr className="text-left"><th>Tên</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead>
          <tbody>{o.items.map((i) => <tr key={i.id} className="border-t dark:border-slate-700"><td className="py-1">{i.name}</td><td>{i.quantity}</td><td>{money(i.unit_price)}</td><td>{money(i.line_total)}</td></tr>)}</tbody></table>
        <p className="mt-2 text-right font-bold">Tổng cộng: {money(o.total)}</p></section>
      <section className="card max-w-2xl"><h2 className="mb-2 font-semibold">Lịch sử trạng thái</h2>
        <ol className="space-y-1 text-sm">{o.history.map((h, i) => <li key={i} className="flex items-center gap-2"><Badge s={h.status} /><span className="text-slate-500">{dateTime(h.changed_at)}</span></li>)}</ol></section>
    </div>
  );
}
