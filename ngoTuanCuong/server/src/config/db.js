import 'dotenv/config';
import { Sequelize } from 'sequelize';

const e = process.env;
export const db = new Sequelize(e.DB_NAME || 'AdminPanel', e.DB_USER, e.DB_PASSWORD || e.DB_PASS, {
  dialect: 'mssql', host: e.DB_SERVER || e.DB_HOST, port: e.DB_INSTANCE ? undefined : Number(e.DB_PORT || 1433), logging: false,
  dialectOptions: { options: { encrypt: false, trustServerCertificate: true, ...(e.DB_INSTANCE ? { instanceName: e.DB_INSTANCE } : {}) } },
});
// q: truy vấn SELECT (trả mảng dòng); run: câu lệnh ghi
export const q = (sql, replacements = {}, t) => db.query(sql, { replacements, type: 'SELECT', transaction: t });
export const run = (sql, replacements = {}, t) => db.query(sql, { replacements, transaction: t });
