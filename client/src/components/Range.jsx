// Chọn khoảng thời gian (số tháng) cho biểu đồ
export default function Range({ value, onChange }) {
  return (
    <div className="flex gap-1" role="group" aria-label="Khoảng thời gian">
      {[3, 6, 12].map((m) => <button key={m} onClick={() => onChange(m)} aria-pressed={value === m} className={`rounded px-2 py-1 text-xs transition-colors ${value === m ? 'bg-blue-600 text-white' : 'border dark:border-slate-600'}`}>{m} tháng</button>)}
    </div>
  );
}
