import { STATUS } from '../lib/labels.js';

const COL = { green: 'bg-green-100 text-green-700', amber: 'bg-amber-100 text-amber-700', blue: 'bg-blue-100 text-blue-700', red: 'bg-red-100 text-red-700' };
const OF = { active: 'green', paid: 'green', delivered: 'green', pending: 'amber', shipped: 'blue', cancelled: 'red', inactive: 'red' };

export default function Badge({ s }) {
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${COL[OF[s] || 'blue']}`}>{STATUS[s] || s}</span>;
}
