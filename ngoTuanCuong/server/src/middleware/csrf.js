// Chống CSRF: bắt buộc header X-Requested-With với các method ghi
export default (req, res, next) => (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || req.get('X-Requested-With') ? next() : res.status(403).json({ message: 'CSRF' }));
