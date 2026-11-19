import { useEffect, useRef, useState } from 'react';
import api, { errMsg } from '../lib/api.js';
import useFetch from '../hooks/useFetch.js';
import Field, { inputCls } from './Field.jsx';
import Modal from './Modal.jsx';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// Form thêm/sửa dùng chung. fields: [{ name, label, type?, required?, min?, num?, options?: [{id,name}], optionsFrom?, placeholder?, default? }]
// Lỗi hiện dưới từng trường; lỗi từ server (409, 400…) hiện cuối form. Có row => PUT `${endpoint}/${row.id}`, không có => POST endpoint.
export default function FormModal({ title, fields, row, endpoint, onClose }) {
  const needLookup = fields.some((f) => f.optionsFrom);
  const { data: lk } = useFetch('/lookup', undefined, needLookup);
  const [v, setV] = useState(() => Object.fromEntries(fields.map((f) => [f.name, row?.[f.name] ?? f.default ?? ''])));
  const [errs, setErrs] = useState({}); const [serverErr, setServerErr] = useState(''); const [busy, setBusy] = useState(false);
  const first = useRef(null);
  useEffect(() => { first.current?.focus(); }, []);
  const submit = async (ev) => {
    ev.preventDefault(); const e = {};
    for (const f of fields) {
      const x = String(v[f.name] ?? '').trim();
      if (f.required && !x) e[f.name] = 'Bắt buộc nhập';
      else if (f.type === 'number' && x !== '' && (Number.isNaN(Number(x)) || Number(x) < (f.min ?? 0))) e[f.name] = `Phải là số ≥ ${f.min ?? 0}`;
      else if (f.type === 'email' && x && !EMAIL.test(x)) e[f.name] = 'Email không hợp lệ';
    }
    setErrs(e); if (Object.keys(e).length) return;
    const body = { ...v }; fields.forEach((f) => { if (f.type === 'number' || f.num) body[f.name] = Number(body[f.name]); });
    setBusy(true); setServerErr('');
    try { await (row ? api.put(`${endpoint}/${row.id}`, body) : api.post(endpoint, body)); onClose(true); } catch (x) { setServerErr(errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={submit} className="space-y-3" noValidate>
        {fields.map((f, i) => {
          const list = f.options || lk?.[f.optionsFrom] || [];
          const common = { ref: i === 0 ? first : null, className: inputCls, value: v[f.name], onChange: (x) => setV({ ...v, [f.name]: x.target.value }) };
          return (
            <Field key={f.name} label={f.label} error={errs[f.name]}>
              {f.options || f.optionsFrom
                ? <select {...common}><option value="">— Chọn —</option>{list.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
                : <input {...common} type={f.type === 'number' ? 'number' : 'text'} step="any" placeholder={f.placeholder} />}
            </Field>
          );
        })}
        {serverErr && <p role="alert" className="text-sm text-red-500">{serverErr}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded border px-3 py-1" onClick={() => onClose()}>Hủy</button>
          <button disabled={busy} className="rounded bg-blue-600 px-3 py-1 text-white disabled:opacity-50">{busy ? 'Đang lưu…' : 'Lưu'}</button>
        </div>
      </form>
    </Modal>
  );
}
