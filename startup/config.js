const config = require("config");
const dotenv = require("dotenv");

dotenv.config();

const jwtPrivateKey = process.env.jwtPrivateKey;

module.exports = function () {
  if (!jwtPrivateKey) {
    throw new Error("FATAL ERROR: jwtPrivateKey not defined.");
  }
};
