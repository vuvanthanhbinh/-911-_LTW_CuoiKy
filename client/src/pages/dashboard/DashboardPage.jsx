import { useState } from 'react';
import RevenueChart from '../../components/charts/RevenueChart.jsx';
import Badge from '../../components/Badge.jsx';
import KpiCard from '../../components/KpiCard.jsx';
import Loading from '../../components/Loading.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Range from '../../components/Range.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import { date, money } from '../../lib/format.js';

export default function DashboardPage() {
  const { t } = useSettings(); const [months, setMonths] = useState(12);
  const { data, error } = useFetch('/stats', { months });
  if (!data) return <Loading error={error} />;
  const k = data.kpi;
  return (
    <div className="space-y-4">
      <PageHeader title={t('Dashboard')} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Doanh thu" value={money(k.revenue)} /><KpiCard label="Đơn hàng" value={k.orders} /><KpiCard label="Khách hàng" value={k.customers} /><KpiCard label="Sản phẩm" value={k.products} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="card lg:col-span-2"><div className="mb-2 flex items-center justify-between"><h2 className="font-semibold">Doanh thu theo tháng</h2><Range value={months} onChange={setMonths} /></div><RevenueChart data={data.series} /></section>
        <section className="card"><h2 className="mb-2 font-semibold">Bán chạy nhất</h2>{data.topProducts.map((p) => <div key={p.name} className="flex justify-between gap-2 border-b py-1 text-sm dark:border-slate-700"><span className="truncate">{p.name}</span><b>{p.sold}</b></div>)}</section>
      </div>
      <section className="card overflow-x-auto"><h2 className="mb-2 font-semibold">Đơn hàng gần đây</h2>
        <table className="w-full text-sm"><tbody>{data.recentOrders.map((o) => <tr key={o.code} className="border-t dark:border-slate-700"><td className="py-1">{o.code}</td><td>{o.customer_name}</td><td>{date(o.created_at)}</td><td>{money(o.total)}</td><td><Badge s={o.status} /></td></tr>)}</tbody></table></section>
    </div>
  );
}
