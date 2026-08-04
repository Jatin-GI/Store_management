const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Login required" });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;
