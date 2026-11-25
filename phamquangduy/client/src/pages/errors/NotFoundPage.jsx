import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="p-8 text-center"><p className="text-2xl font-bold">404 – Không tìm thấy trang</p><Link to="/dashboard" className="mt-3 inline-block text-blue-600">Về trang tổng quan</Link></div>;
}
