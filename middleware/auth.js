const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const jwtPrivateKey = process.env.ACCESS_TOKEN_SECRET;

function auth(req, res, next) {
  // console.info(`[info]: Auth middleware checking token`);
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const decoded = jwt.verify(token, jwtPrivateKey);
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
}

module.exports = auth;
