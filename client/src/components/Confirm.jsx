import Modal from './Modal.jsx';

export default function Confirm({ text, onYes, onNo }) {
  return (
    <Modal title="Xác nhận" onClose={onNo}>
      <p className="text-sm">{text}</p>
      <div className="flex justify-end gap-2">
        <button className="rounded border px-3 py-1" onClick={onNo}>Hủy</button>
        <button className="rounded bg-red-600 px-3 py-1 text-white" onClick={onYes}>Đồng ý</button>
      </div>
    </Modal>
  );
}
