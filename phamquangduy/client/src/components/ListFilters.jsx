const cls = 'rounded border p-2 text-sm dark:border-slate-600 dark:bg-slate-800';
// Ô tìm kiếm + lọc trạng thái cho các trang dạng bảng
export default function ListFilters({ qq, setQq, status, setStatus, statusOptions }) {
  return (
    <div className="flex flex-wrap gap-2">
      <input aria-label="Tìm kiếm" placeholder="Tìm kiếm…" value={qq} onChange={(e) => setQq(e.target.value)} className={cls} />
      <select aria-label="Lọc trạng thái" value={status} onChange={(e) => setStatus(e.target.value)} className={cls}>
        <option value="">Tất cả trạng thái</option>{statusOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </div>
  );
}
