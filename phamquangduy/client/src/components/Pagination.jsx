export default function Pagination({ page, pages, total, onPage }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <button aria-label="Trang trước" disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded border px-2 disabled:opacity-40 dark:border-slate-600">‹</button>
      <span>Trang {page}/{pages} · {total} dòng</span>
      <button aria-label="Trang sau" disabled={page >= pages} onClick={() => onPage(page + 1)} className="rounded border px-2 disabled:opacity-40 dark:border-slate-600">›</button>
    </div>
  );
}
