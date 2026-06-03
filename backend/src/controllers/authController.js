// TODO: Implement register logic (hash password, create user, return JWT)
const register = (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

// TODO: Implement login logic (validate credentials, return JWT)
const login = (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

// TODO: Implement getMe logic (return current user from token)
const getMe = (req, res) => {
  res.status(501).json({ message: 'Not implemented' });
};

module.exports = { register, login, getMe };
