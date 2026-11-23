import { useEffect, useState } from 'react';
import Field, { inputCls } from '../../components/Field.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import api, { errMsg } from '../../lib/api.js';
import { ROLE } from '../../lib/labels.js';

const TABS = [['general', 'Chung'], ['profile', 'Hồ sơ'], ['security', 'Bảo mật'], ['notifications', 'Thông báo'], ['appearance', 'Giao diện']];
// Toàn bộ trang Cài đặt chỉ dành cho Admin (route được bảo vệ bằng ProtectedRoute roles=['admin'])
export default function SettingsPage() {
  const [tab, setTab] = useState('general'); const { user, setUser } = useAuth(); const st = useSettings(); const toast = useToast();
  const [g, setG] = useState({ site_name: st.site_name, language: st.language, currency: st.currency });
  const [name, setName] = useState(user.name); const [pw, setPw] = useState({ current: '', next: '' }); const [err, setErr] = useState('');
  useEffect(() => { setG({ site_name: st.site_name, language: st.language, currency: st.currency }); }, [st.site_name, st.language, st.currency]);
  const run = async (fn, ok) => { setErr(''); try { await fn(); toast(ok); } catch (e) { setErr(errMsg(e)); } };
  return (
    <div className="space-y-3"><PageHeader title={st.t('Settings')} />
      <div className="flex flex-wrap gap-2" role="tablist">{TABS.map(([k, l]) => <button key={k} role="tab" aria-selected={tab === k} onClick={() => { setTab(k); setErr(''); }} className={`rounded px-3 py-1 text-sm transition-colors ${tab === k ? 'bg-blue-600 text-white' : 'border dark:border-slate-600'}`}>{l}</button>)}</div>
      <section className="card max-w-lg space-y-3">
        {tab === 'general' && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(() => st.save(g), 'Đã lưu cài đặt'); }}>
            <Field label="Tên website"><input className={inputCls} value={g.site_name} onChange={(e) => setG({ ...g, site_name: e.target.value })} /></Field>
            <Field label="Ngôn ngữ menu"><select className={inputCls} value={g.language} onChange={(e) => setG({ ...g, language: e.target.value })}><option value="vi">Tiếng Việt</option><option value="en">English</option></select></Field>
            <Field label="Tiền tệ hiển thị (không quy đổi tỷ giá)"><select className={inputCls} value={g.currency} onChange={(e) => setG({ ...g, currency: e.target.value })}><option value="VND">VND (₫)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option></select></Field>
            <button className="rounded bg-blue-600 px-3 py-2 text-white">Lưu thay đổi</button></form>)}
        {tab === 'profile' && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(async () => setUser((await api.put('/auth/profile', { name })).data), 'Đã cập nhật hồ sơ'); }}>
            <Field label="Họ tên"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <p className="text-sm text-slate-500">{user.email} · {ROLE[user.role]}</p><button className="rounded bg-blue-600 px-3 py-2 text-white">Lưu</button></form>)}
        {tab === 'security' && (
          <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); run(async () => { await api.put('/auth/password', pw); setPw({ current: '', next: '' }); }, 'Đã đổi mật khẩu'); }}>
            <Field label="Mật khẩu hiện tại"><input type="password" className={inputCls} value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></Field>
            <Field label="Mật khẩu mới (tối thiểu 8 ký tự, gồm chữ và số)"><input type="password" className={inputCls} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></Field>
            <button className="rounded bg-blue-600 px-3 py-2 text-white">Đổi mật khẩu</button></form>)}
        {tab === 'notifications' && (
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" checked={st.prefs.low} onChange={(e) => st.setPrefs({ ...st.prefs, low: e.target.checked })} />Báo sản phẩm sắp hết hàng</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={st.prefs.pending} onChange={(e) => st.setPrefs({ ...st.prefs, pending: e.target.checked })} />Báo đơn chờ xử lý</label>
            <p className="text-xs text-slate-500">Lưu trên trình duyệt này (chỉ chạy ở frontend).</p></div>)}
        {tab === 'appearance' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={st.dark} onChange={(e) => st.setDark(e.target.checked)} />Chế độ tối (chỉ chạy ở frontend)</label>}
        {err && <p role="alert" className="text-sm text-red-500">{err}</p>}
      </section>
    </div>
  );
}
