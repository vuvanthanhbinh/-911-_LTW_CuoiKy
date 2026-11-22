import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Field, { inputCls } from '../../components/Field.jsx';
import Loading from '../../components/Loading.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import useFetch from '../../hooks/useFetch.js';
import api, { errMsg } from '../../lib/api.js';
import { money } from '../../lib/format.js';
import { PAYMENT } from '../../lib/labels.js';
import { cartActions } from '../../store/cartSlice.js';

export default function OrderCreatePage() {
  const { data: lk, error } = useFetch('/lookup');
  const items = useSelector((s) => s.cart.items); const dispatch = useDispatch(); const nav = useNavigate(); const toast = useToast();
  const [f, setF] = useState({ customer_id: '', payment_method: 'cash', note: '', pick: '' });
  const [errs, setErrs] = useState({}); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const total = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]); // chỉ xem trước; server tính lại theo giá DB
  if (!lk) return <Loading error={error} />;
  const add = () => { const p = lk.products.find((x) => x.id === Number(f.pick)); if (p) dispatch(cartActions.add(p)); };
  const submit = async (ev) => {
    ev.preventDefault(); const e = {};
    if (!f.customer_id) e.customer_id = 'Chọn khách hàng';
    if (!items.length) e.items = 'Thêm ít nhất 1 sản phẩm';
    setErrs(e); setMsg(''); if (Object.keys(e).length) return;
    setBusy(true);
    try {
      const r = await api.post('/orders', { customer_id: Number(f.customer_id), payment_method: f.payment_method, note: f.note, items: items.map(({ product_id, quantity }) => ({ product_id, quantity })) });
      dispatch(cartActions.clear()); toast(`Đã tạo đơn ${r.data.code}`); nav(`/orders/${r.data.id}`);
    } catch (x) { setMsg(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={submit} className="space-y-3" noValidate>
      <Link to="/orders" className="text-sm text-blue-600">← Đơn hàng</Link><h1 className="text-xl font-bold">Tạo đơn hàng</h1>
      <div className="grid gap-3 md:grid-cols-2">
        <section className="card space-y-3">
          <Field label="Khách hàng" error={errs.customer_id}><select className={inputCls} value={f.customer_id} onChange={(e) => setF({ ...f, customer_id: e.target.value })}><option value="">— Chọn —</option>{lk.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label="Phương thức thanh toán"><select className={inputCls} value={f.payment_method} onChange={(e) => setF({ ...f, payment_method: e.target.value })}>{Object.entries(PAYMENT).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></Field>
          <Field label="Ghi chú"><input className={inputCls} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></Field>
        </section>
        <section className="card space-y-3">
          <Field label="Thêm sản phẩm" error={errs.items}><div className="flex gap-2"><select className={inputCls} value={f.pick} onChange={(e) => setF({ ...f, pick: e.target.value })}><option value="">— Chọn —</option>{lk.products.map((p) => <option key={p.id} value={p.id}>{p.name} ({money(p.price)}, kho {p.stock})</option>)}</select><button type="button" aria-label="Thêm vào đơn" onClick={add} className="mt-1 rounded bg-blue-600 px-3 text-white">+</button></div></Field>
          {items.map((i) => (
            <div key={i.product_id} className="flex items-center gap-2 text-sm"><span className="flex-1 truncate">{i.name}</span>
              <input aria-label="Số lượng" type="number" min="1" max={i.stock} value={i.quantity} onChange={(e) => dispatch(cartActions.setQty({ id: i.product_id, quantity: e.target.value }))} className="w-16 rounded border p-1 dark:border-slate-600 dark:bg-slate-700" />
              <span className="w-28 text-right">{money(i.price * i.quantity)}</span><button type="button" aria-label="Bỏ khỏi đơn" className="text-red-500" onClick={() => dispatch(cartActions.remove(i.product_id))}>✕</button></div>))}
          <p className="text-right font-bold">Tạm tính: {money(total)}</p>
        </section>
      </div>
      {msg && <p role="alert" className="text-sm text-red-500">{msg}</p>}
      <button disabled={busy} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">{busy ? 'Đang tạo…' : 'Tạo đơn'}</button>
    </form>
  );
}
