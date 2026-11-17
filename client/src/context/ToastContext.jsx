import { createContext, useCallback, useContext, useState } from 'react';

const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);
  const push = useCallback((msg, type = 'ok') => {
    const id = Date.now() + Math.random();
    setList((l) => [...l, { id, msg, type }]);
    setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2" aria-live="polite">
        {list.map((x) => <div key={x.id} className={`page rounded-lg px-4 py-2 text-sm text-white shadow-lg ${x.type === 'err' ? 'bg-red-600' : 'bg-green-600'}`}>{x.msg}</div>)}
      </div>
    </Ctx.Provider>
  );
}
