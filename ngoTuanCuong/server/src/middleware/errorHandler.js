export default (err, req, res, next) => res.status(Number.isInteger(err.status) ? err.status : 500).json({ message: err.message, ...(err.extra || {}) });
