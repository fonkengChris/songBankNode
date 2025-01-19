const mongoose = require("mongoose");
const winston = require("winston");
require("dotenv").config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development",
});

module.exports = function () {
  const db = process.env.MONGODB_URI;
  // const db = process.env.MONGODB_URI || "mongodb://localhost/songLibrary";

  mongoose
    .connect(db)
    .then(() => {
      winston.info(
        `Connected to MongoDB (${process.env.NODE_ENV} environment)...`
      );
    })
    .catch((err) => {
      winston.error("Failed to connect to MongoDB", err);
    });
};
