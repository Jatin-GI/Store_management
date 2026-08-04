const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const generateToken = (email, id) => {
  return jwt.sign({ email, id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
};

module.exports = generateToken;
