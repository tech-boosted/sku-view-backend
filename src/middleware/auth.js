const jwt = require("jsonwebtoken");

secretKey = process.env.SECRETKEY;

const auth = (req, res, next) => {

  var token;
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization) {
    var bearerToken = req.headers.authorization;
    if (bearerToken != "" && bearerToken != undefined) {
      token = bearerToken.slice(7);
    }
  } else {
    res.status(403).json({ "message": "A token is required for authentication" });
  }

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

module.exports = auth;