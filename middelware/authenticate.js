const { decodeToken } = require('../utils/tokenUtils');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Expecting: Authorization: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decodedToken = decodeToken(token);

  if (!decodedToken) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = decodedToken;
  next();
};

module.exports = { authenticate };
