const jwt = require("jsonwebtoken");

secretKey = process.env.SECRETKEY;

const useCookie = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).json({ "message": "A token is required for authentication" });
  }
  try {
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json({ "message": "Invalid Token" });
  }
  return next();
};

const useAuth = (req, res, next) => {
  var bearerToken = req.headers.authorization;
  if (bearerToken != "" && bearerToken != undefined) {
    var token = bearerToken.slice(7);
    if (!token) {
      return res.status(403).json({ "message": "A token is required for authentication" });
    }
    try {
      const decoded = jwt.verify(token, secretKey);
      req.user = decoded;
    } catch (err) {
      return res.status(401).json({ "message": "Invalid Token" });
    }
  } else {
    return res.status(403).json({ "message": "A token is required for authentication" });
  }
  return next();
};

module.exports = {
  useCookie: useCookie,
  useAuth: useAuth,
};