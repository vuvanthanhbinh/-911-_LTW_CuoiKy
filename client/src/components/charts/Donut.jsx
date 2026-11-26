import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { money } from '../../lib/format.js';

export const COLORS = ['#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6', '#6366f1', '#a855f7'];
// data: [{ name, value }]; asMoney = true thì tooltip hiện tiền
export default function Donut({ data, asMoney }) {
  const rows = data.map((d) => ({ ...d, value: Number(d.value) }));
  return (
    <ResponsiveContainer width="100%" height={270}>
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2} animationDuration={800}>{rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie>
        <Tooltip formatter={(v) => (asMoney ? money(v) : v)} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
