import ActionMenu from './ActionMenu.jsx';

// Bảng dùng chung. cols: [{ key, label, render?(value,row), sort? }]; actions(row) => items cho ActionMenu
export default function DataTable({ cols, rows, sort, dir, onSort, actions, loading }) {
  return (
    <div className={`card overflow-x-auto transition-opacity duration-200 ${loading ? 'opacity-60' : ''}`}>
      <table className="w-full text-left text-sm">
        <thead><tr>
          {cols.map((c) => <th key={c.key} aria-sort={c.sort && sort === c.sort ? (dir === 'asc' ? 'ascending' : 'descending') : undefined} className={`py-2 pr-3 ${c.sort ? 'cursor-pointer select-none' : ''}`} onClick={() => c.sort && onSort(c.sort)}>{c.label}{sort === c.sort && c.sort ? (dir === 'asc' ? ' ▲' : ' ▼') : ''}</th>)}
          {actions && <th className="w-14 text-center">Thao tác</th>}
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/40">
              {cols.map((c) => <td key={c.key} className="py-2 pr-3">{c.render ? c.render(r[c.key], r) : r[c.key]}</td>)}
              {actions && <td className="text-center"><ActionMenu items={actions(r)} /></td>}
            </tr>))}
        </tbody>
      </table>
      {rows.length === 0 && !loading && <p className="py-6 text-center text-slate-500">Không có dữ liệu</p>}
    </div>
  );
}
