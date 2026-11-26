export default function KpiCard({ label, value }) {
  return <div className="card"><p className="text-sm text-slate-500">{label}</p><p className="truncate text-xl font-bold md:text-2xl">{value}</p></div>;
}
