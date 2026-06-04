const notFound = (req, res) => {
  return res.status(404).json({ message: 'Route not found' });
};

const errorHandler = (error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' });
  }

  const statusCode =
    Number.isInteger(error.statusCode) && error.statusCode >= 400 && error.statusCode < 600
      ? error.statusCode
      : 500;

  if (statusCode === 500) {
    return res.status(500).json({ message: 'Internal server error' });
  }

  return res.status(statusCode).json({ message: error.message || 'Request failed' });
};

module.exports = { notFound, errorHandler };
