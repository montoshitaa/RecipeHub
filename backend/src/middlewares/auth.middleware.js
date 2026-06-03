// TODO: Implement JWT verification middleware
const protect = (req, res, next) => {
  res.status(501).json({ message: 'Not implemented' });
};

module.exports = { protect };
