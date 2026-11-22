import { Link, useNavigate } from 'react-router-dom';
import Badge from '../../components/Badge.jsx';
import DataTable from '../../components/DataTable.jsx';
import ListFilters from '../../components/ListFilters.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useAction from '../../hooks/useAction.js';
import useConfirm from '../../hooks/useConfirm.jsx';
import useListQuery from '../../hooks/useListQuery.js';
import api, { errMsg } from '../../lib/api.js';
import { date, money } from '../../lib/format.js';
import { NEXT_STATUS, ORDER_OPTS, PAYMENT, STATUS } from '../../lib/labels.js';

const COLS = [
  { key: 'code', label: 'Mã đơn', render: (v, r) => <Link to={`/orders/${r.id}`} className="text-blue-600 hover:underline">{v}</Link> },
  { key: 'customer', label: 'Khách hàng' }, { key: 'created_at', label: 'Ngày đặt', sort: 'date', render: (v) => date(v) },
  { key: 'items', label: 'Số SP' }, { key: 'total', label: 'Tổng tiền', sort: 'total', render: (v) => money(v) },
  { key: 'payment_method', label: 'Thanh toán', render: (v) => PAYMENT[v] || v }, { key: 'status', label: 'Trạng thái', render: (s) => <Badge s={s} /> },
];

export default function OrdersPage() {
  const { t } = useSettings(); const toast = useToast(); const nav = useNavigate();
  const lq = useListQuery('orders'); const act = useAction(lq.reload); const [confirmNode, confirm] = useConfirm();
  const setStatus = (r, status, ok) => act(() => api.put(`/orders/${r.id}/status`, { status }), ok);
  const actions = (r) => [
    { label: 'Xem chi tiết', onClick: () => nav(`/orders/${r.id}`) },
    { label: `Chuyển sang: ${STATUS[NEXT_STATUS[r.status]]}`, hidden: !NEXT_STATUS[r.status], onClick: () => setStatus(r, NEXT_STATUS[r.status], 'Đã cập nhật trạng thái') },
    { label: 'Hủy đơn', danger: true, hidden: !['pending', 'paid'].includes(r.status), onClick: () => confirm(`Hủy đơn ${r.code}? Kho sẽ được hoàn lại.`, () => setStatus(r, 'cancelled', 'Đã hủy đơn')) },
  ];
  const exportCsv = async () => {
    try {
      const r = await api.get('/orders/export', { params: { status: lq.p.status }, responseType: 'blob' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(r.data); a.download = 'don-hang.csv'; a.click(); URL.revokeObjectURL(a.href);
    } catch (e) { toast(errMsg(e), 'err'); }
  };
  return (
    <div className="space-y-3">
      <PageHeader title={t('Orders')}>
        <button onClick={exportCsv} className="rounded border px-3 py-2 text-sm dark:border-slate-600">Xuất CSV</button>
        <Link to="/orders/new" className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">+ Tạo đơn</Link>
      </PageHeader>
      <ListFilters qq={lq.qq} setQq={lq.setQq} status={lq.p.status} setStatus={lq.setStatus} statusOptions={ORDER_OPTS} />
      {lq.error && <p className="text-red-500">{lq.error}</p>}
      <DataTable cols={COLS} rows={lq.data?.rows || []} sort={lq.p.sort} dir={lq.p.dir} onSort={lq.sortBy} actions={actions} loading={lq.loading} />
      <Pagination page={lq.p.page} pages={lq.pages} total={lq.data?.total ?? 0} onPage={lq.setPage} />
      {confirmNode}
    </div>
  );
}
