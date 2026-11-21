import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FormModal from '../../components/FormModal.jsx';
import Loading from '../../components/Loading.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import SearchBox from '../../components/SearchBox.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useAction from '../../hooks/useAction.js';
import useConfirm from '../../hooks/useConfirm.jsx';
import useDebounce from '../../hooks/useDebounce.js';
import useInfinite from '../../hooks/useInfinite.js';
import api from '../../lib/api.js';
import { ACTIVE_OPTS } from '../../lib/labels.js';
import ProductCard from './ProductCard.jsx';

const SORTS = [['id:desc', 'Mới nhất'], ['price:asc', 'Giá thấp → cao'], ['price:desc', 'Giá cao → thấp'], ['name:asc', 'Tên A → Z']];
const FIELDS = [
  { name: 'sku', label: 'Mã SKU', required: true }, { name: 'name', label: 'Tên sản phẩm', required: true },
  { name: 'category_id', label: 'Danh mục', optionsFrom: 'categories', required: true, num: true },
  { name: 'price', label: 'Giá bán', type: 'number', required: true }, { name: 'stock', label: 'Tồn kho', type: 'number', required: true },
  { name: 'image_url', label: 'Link ảnh (có thể để trống)', placeholder: 'https://…' },
  { name: 'status', label: 'Trạng thái', options: ACTIVE_OPTS, default: 'active' },
];

export default function ProductsPage() {
  const { user } = useAuth(); const { t } = useSettings(); const toast = useToast();
  const [sp] = useSearchParams(); const initQ = sp.get('q') || '';
  const [qq, setQq] = useState(initQ); const [status, setStatus] = useState(''); const [sort, setSort] = useState('id:desc');
  useEffect(() => { setQq(initQ); }, [initQ]);
  const dq = useDebounce(qq, 300); const [sortKey, dir] = sort.split(':');
  const params = useMemo(() => ({ q: dq, status, sort: sortKey, dir }), [dq, status, sortKey, dir]);
  const { items, total, loading, error, hasMore, sentinelRef, reload } = useInfinite('products', params, 20);
  const [form, setForm] = useState(null); const [confirmNode, confirm] = useConfirm(); const act = useAction(reload);
  const onEdit = useCallback((row) => setForm({ row }), []);
  const onDelete = useCallback((row) => confirm(`Xóa sản phẩm "${row.name}"?`, () => act(() => api.delete(`/products/${row.id}`), 'Đã xóa sản phẩm')), [confirm, act]);
  const sel = 'rounded border p-2 text-sm dark:border-slate-600 dark:bg-slate-800';
  return (
    <div className="space-y-3">
      <PageHeader title={t('Products')}><button onClick={() => setForm({ row: null })} className="rounded bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700">+ Thêm sản phẩm</button></PageHeader>
      <div className="flex flex-wrap gap-2">
        <SearchBox className="w-64" value={qq} onChange={setQq} placeholder="Tìm sản phẩm…" onSubmit={setQq} onPick={(p) => setQq(p.name)} />
        <select aria-label="Lọc trạng thái" value={status} onChange={(e) => setStatus(e.target.value)} className={sel}><option value="">Tất cả trạng thái</option>{ACTIVE_OPTS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
        <select aria-label="Sắp xếp" value={sort} onChange={(e) => setSort(e.target.value)} className={sel}>{SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <span className="self-center text-sm text-slate-500">{items.length}/{total} sản phẩm</span>
      </div>
      {error && <Loading error={error} />}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((p) => <ProductCard key={p.id} p={p} isAdmin={user.role === 'admin'} onEdit={onEdit} onDelete={onDelete} />)}
        {loading && items.length === 0 && Array.from({ length: 10 }, (_, i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />)}
      </div>
      {!loading && items.length === 0 && !error && <p className="py-10 text-center text-slate-500">Không tìm thấy sản phẩm</p>}
      <div ref={sentinelRef} className="h-8 text-center text-sm text-slate-500">{loading && items.length > 0 ? 'Đang tải thêm…' : !hasMore && items.length > 0 ? 'Đã hiển thị hết' : ''}</div>
      {form && <FormModal title={form.row ? 'Sửa sản phẩm' : 'Thêm sản phẩm'} fields={FIELDS} row={form.row} endpoint="/products" onClose={(ok) => { setForm(null); if (ok === true) { toast('Đã lưu sản phẩm'); reload(); } }} />}
      {confirmNode}
    </div>
  );
}
