import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { compact, money } from '../../lib/format.js';

// Đường monotone uốn lượn mượt + gradient; dữ liệu đã điền 0 nên đường không bị đứt
export default function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} /><stop offset="100%" stopColor="#2563eb" stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
        <XAxis dataKey="label" tickLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} width={52} tickFormatter={compact} />
        <Tooltip formatter={(v) => money(v)} />
        <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#2563eb" strokeWidth={2.5} fill="url(#rev)" animationDuration={800} animationEasing="ease-in-out" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
