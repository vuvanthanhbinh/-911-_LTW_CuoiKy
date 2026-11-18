import { useCallback, useState } from 'react';
import Confirm from '../components/Confirm.jsx';

// const [confirmNode, confirm] = useConfirm();  confirm('Xóa?', () => ...);  render {confirmNode}
export default function useConfirm() {
  const [ask, setAsk] = useState(null);
  const confirm = useCallback((text, fn) => setAsk({ text, fn }), []);
  const node = ask ? <Confirm text={ask.text} onNo={() => setAsk(null)} onYes={() => { const f = ask.fn; setAsk(null); f(); }} /> : null;
  return [node, confirm];
}
