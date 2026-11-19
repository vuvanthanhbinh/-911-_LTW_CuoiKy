import { useCallback } from 'react';
import { errMsg } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

// Chạy một thao tác ghi: báo toast thành công/lỗi rồi tải lại danh sách
export default function useAction(reload) {
  const toast = useToast();
  return useCallback(async (fn, okMsg) => {
    try { await fn(); toast(okMsg); reload?.(); } catch (e) { toast(errMsg(e), 'err'); }
  }, [toast, reload]);
}
