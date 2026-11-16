export const inputCls = 'mt-1 w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-700';

// Nhãn + ô nhập + lỗi ngay dưới ô
export default function Field({ label, error, children }) {
  return <label className="block text-sm">{label}{children}{error && <span role="alert" className="mt-1 block text-xs text-red-500">{error}</span>}</label>;
}
