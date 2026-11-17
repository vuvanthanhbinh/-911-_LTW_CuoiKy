// Nhãn tiếng Việt cho các giá trị lưu trong database
export const STATUS = { active: 'Hoạt động', inactive: 'Ngừng hoạt động', pending: 'Chờ xử lý', paid: 'Đã thanh toán', shipped: 'Đang giao', delivered: 'Đã giao', cancelled: 'Đã hủy' };
export const PAYMENT = { card: 'Thẻ', cash: 'Tiền mặt', transfer: 'Chuyển khoản' };
export const ROLE = { admin: 'Quản trị viên', staff: 'Nhân viên' };
export const NEXT_STATUS = { pending: 'paid', paid: 'shipped', shipped: 'delivered' };
export const opts = (keys, map) => keys.map((k) => ({ id: k, name: map[k] }));
export const ACTIVE_OPTS = opts(['active', 'inactive'], STATUS);
export const ORDER_OPTS = opts(['pending', 'paid', 'shipped', 'delivered', 'cancelled'], STATUS);
