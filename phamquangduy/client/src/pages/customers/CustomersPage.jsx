import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Badge from '../../components/Badge.jsx';
import DataTable from '../../components/DataTable.jsx';
import FormModal from '../../components/FormModal.jsx';
import ListFilters from '../../components/ListFilters.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import Pagination from '../../components/Pagination.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useAction from '../../hooks/useAction.js';
import useConfirm from '../../hooks/useConfirm.jsx';
import useListQuery from '../../hooks/useListQuery.js';
import api from '../../lib/api.js';
import { money } from '../../lib/format.js';
import { ACTIVE_OPTS } from '../../lib/labels.js';

const FIELDS = [
  { name: 'name', label: 'Họ tên', required: true }, { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Điện thoại' }, { name: 'address', label: 'Địa chỉ' }, { name: 'status', label: 'Trạng thái', options: ACTIVE_OPTS, default: 'active' },
];
const COLS = [
  { key: 'code', label: 'Mã' },
  { key: 'name', label: 'Họ tên', sort: 'name', render: (v, r) => <Link to={`/customers/${r.id}`} className="text-blue-600 hover:underline">{v}</Link> },
  { key: 'email', label: 'Email' }, { key: 'orders_count', label: 'Số đơn', sort: 'orders' },
  { key: 'total_spent', label: 'Tổng chi tiêu', sort: 'spent', render: (v) => money(v) }, { key: 'status', label: 'Trạng thái', render: (s) => <Badge s={s} /> },
];

export default function CustomersPage() {
  const { user } = useAuth(); const { t } = useSettings(); const toast = useToast(); const nav = useNavigate();
  const lq = useListQuery('customers'); const act = useAction(lq.reload);
  const [form, setForm] = useState(null); const [confirmNode, confirm] = useConfirm();
  const actions = (r) => [
    { label: 'Xem chi tiết', onClick: () => nav(`/customers/${r.id}`) },
    { label: 'Sửa', onClick: () => setForm({ row: r }) },
    { label: 'Xóa', danger: true, hidden: user.role !== 'admin', onClick: () => confirm(`Xóa khách hàng "${r.name}"?`, () => act(() => api.delete(`/customers/${r.id}`), 'Đã xóa khách hàng')) },
  ];
  return (
    <div className="space-y-3">
      <PageHeader title={t('Customers')}><button onClick={() => setForm({ row: null })} className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">+ Thêm khách hàng</button></PageHeader>
      <ListFilters qq={lq.qq} setQq={lq.setQq} status={lq.p.status} setStatus={lq.setStatus} statusOptions={ACTIVE_OPTS} />
      {lq.error && <p className="text-red-500">{lq.error}</p>}
      <DataTable cols={COLS} rows={lq.data?.rows || []} sort={lq.p.sort} dir={lq.p.dir} onSort={lq.sortBy} actions={actions} loading={lq.loading} />
      <Pagination page={lq.p.page} pages={lq.pages} total={lq.data?.total ?? 0} onPage={lq.setPage} />
      {form && <FormModal title={form.row ? 'Sửa khách hàng' : 'Thêm khách hàng'} fields={FIELDS} row={form.row} endpoint="/customers" onClose={(ok) => { setForm(null); if (ok === true) { toast('Đã lưu khách hàng'); lq.reload(); } }} />}
      {confirmNode}
    </div>
  );
}
