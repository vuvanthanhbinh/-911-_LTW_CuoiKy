import { useState } from 'react';
import Badge from '../../components/Badge.jsx';
import Loading from '../../components/Loading.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import api, { errMsg } from '../../lib/api.js';
import { ROLE } from '../../lib/labels.js';

export default function UsersPage() {
  const { t } = useSettings(); const toast = useToast(); const [tick, setTick] = useState(0);
  const { data, error } = useFetch('/users', { tick });
  const toggle = async (u) => {
    try { await api.patch(`/users/${u.id}`, { status: u.status === 'active' ? 'inactive' : 'active' }); setTick((x) => x + 1); toast('Đã cập nhật tài khoản'); } catch (e) { toast(errMsg(e), 'err'); }
  };
  if (!data) return <Loading error={error} />;
  return (
    <div className="space-y-3"><PageHeader title={t('Users')} />
      <section className="card">{data.map((u) => (
        <div key={u.id} className="flex items-center justify-between gap-2 border-t py-2 text-sm first:border-t-0 dark:border-slate-700">
          <span>{u.name} · {u.email} · {ROLE[u.role]}</span>
          <button onClick={() => toggle(u)} title="Bấm để bật/tắt tài khoản" aria-label={`Đổi trạng thái ${u.name}`}><Badge s={u.status} /></button>
        </div>))}</section>
    </div>
  );
}
