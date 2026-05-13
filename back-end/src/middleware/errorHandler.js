const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Max size exceeded.' });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // SQLite unique constraint
  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE' || (err.message && err.message.includes('UNIQUE constraint failed'))) {
    const field = err.message.match(/UNIQUE constraint failed: \w+\.(\w+)/);
    const fieldName = field ? field[1] : 'field';
    return res.status(409).json({ success: false, message: `${fieldName} already exists` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  // Validation errors
  if (err.type === 'validation') {
    return res.status(400).json({ success: false, message: err.message, errors: err.errors });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({ success: false, message });
};

module.exports = { errorHandler };
