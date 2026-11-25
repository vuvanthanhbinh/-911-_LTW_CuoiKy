import 'dotenv/config';
import app, { store } from './src/app.js';
import { db } from './src/config/db.js';

const port = process.env.PORT || 5000;
try {
  await db.authenticate();
  await store.sync(); // tự tạo bảng sessions
} catch (err) {
  console.error('Không kết nối được SQL Server:', err.message);
  process.exit(1);
}
app.listen(port, () => console.log('API http://localhost:' + port));
