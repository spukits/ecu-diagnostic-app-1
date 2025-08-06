const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_secret_key_here';

function auth(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // <-- ΕΔΩ! Παίρνει το userId από το JWT!
    next();
  } catch {
    res.status(401).json({ message: "Token is not valid" });
  }
}
module.exports = auth;
