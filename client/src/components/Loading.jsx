export default function Loading({ error }) {
  return <p className={error ? 'text-red-500' : 'text-slate-500'} role={error ? 'alert' : 'status'}>{error || 'Đang tải…'}</p>;
}
