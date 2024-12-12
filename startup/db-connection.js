const mongoose = require("mongoose");
const winston = require("winston");
require("dotenv").config();

module.exports = function () {
  // const db = process.env.MONGODB_URI;
  const db = process.env.MONGODB_URI || "mongodb://localhost/songLibrary";

  mongoose
    .connect(db)
    .then(() => {
      winston.info(`Connected to ${db}...`);
    })
    .catch((err) => {
      winston.error("Failed to connect to MongoDB", err);
    });
};
