const jwt = require("jsonwebtoken");

secretKey = process.env.SECRETKEY;

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ "message": "A token is required for authentication"});
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ "message": "Invalid Token"});
  }
  return next();
};

module.exports = verifyToken;