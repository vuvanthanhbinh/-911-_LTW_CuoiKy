import { useState } from 'react';
import DataTable from '../../components/DataTable.jsx';
import Badge from '../../components/Badge.jsx';
import FormModal from '../../components/FormModal.jsx';
import ListFilters from '../../components/ListFilters.jsx';
import Pagination from '../../components/Pagination.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useAction from '../../hooks/useAction.js';
import useConfirm from '../../hooks/useConfirm.jsx';
import useListQuery from '../../hooks/useListQuery.js';
import api from '../../lib/api.js';
import { ACTIVE_OPTS } from '../../lib/labels.js';

const FIELDS = [
  { name: 'name', label: 'Tên danh mục', required: true }, { name: 'description', label: 'Mô tả' }, { name: 'icon', label: 'Biểu tượng (tên icon)' },
  { name: 'status', label: 'Trạng thái', options: ACTIVE_OPTS, default: 'active' },
];
const COLS = [
  { key: 'name', label: 'Tên danh mục', sort: 'name' }, { key: 'description', label: 'Mô tả' },
  { key: 'products_count', label: 'Số sản phẩm', sort: 'count' }, { key: 'status', label: 'Trạng thái', render: (s) => <Badge s={s} /> },
];

export default function CategoriesPage() {
  const { user } = useAuth(); const { t } = useSettings(); const toast = useToast();
  const lq = useListQuery('categories'); const act = useAction(lq.reload);
  const [form, setForm] = useState(null); const [confirmNode, confirm] = useConfirm();
  const actions = (r) => [
    { label: 'Sửa', onClick: () => setForm({ row: r }) },
    { label: 'Xóa', danger: true, hidden: user.role !== 'admin', onClick: () => confirm(`Xóa danh mục "${r.name}"?`, () => act(() => api.delete(`/categories/${r.id}`), 'Đã xóa danh mục')) },
  ];
  return (
    <div className="space-y-3">
      <PageHeader title={t('Categories')}><button onClick={() => setForm({ row: null })} className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">+ Thêm danh mục</button></PageHeader>
      <ListFilters qq={lq.qq} setQq={lq.setQq} status={lq.p.status} setStatus={lq.setStatus} statusOptions={ACTIVE_OPTS} />
      {lq.error && <p className="text-red-500">{lq.error}</p>}
      <DataTable cols={COLS} rows={lq.data?.rows || []} sort={lq.p.sort} dir={lq.p.dir} onSort={lq.sortBy} actions={actions} loading={lq.loading} />
      <Pagination page={lq.p.page} pages={lq.pages} total={lq.data?.total ?? 0} onPage={lq.setPage} />
      {form && <FormModal title={form.row ? 'Sửa danh mục' : 'Thêm danh mục'} fields={FIELDS} row={form.row} endpoint="/categories" onClose={(ok) => { setForm(null); if (ok === true) { toast('Đã lưu danh mục'); lq.reload(); } }} />}
      {confirmNode}
    </div>
  );
}
