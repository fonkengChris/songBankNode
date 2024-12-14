const winston = require("winston");
require("winston-mongodb");
require("express-async-errors");

module.exports = function () {
  // Handle uncaught exceptions
  winston.exceptions.handle(
    new winston.transports.Console({
      // Handle exceptions in console
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(
          ({ timestamp, level, message }) =>
            `${timestamp} [${level}]: ${message}`
        )
      ),
    }),
    new winston.transports.File({ filename: "logfile.log" }) // Handle exceptions in file
  );

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (ex) => {
    throw ex;
  });

  // Add a transport for logging to the console
  winston.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(
          ({ timestamp, level, message }) =>
            `${timestamp} [${level}]: ${message}`
        )
      ),
    })
  );

  // Add a transport for logging to a file
  winston.add(
    new winston.transports.File({
      filename: "logfile.log",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(
          ({ timestamp, level, message }) =>
            `${timestamp} [${level}]: ${message}`
        )
      ),
    })
  );

  // Add a transport for logging errors to MongoDB
  winston.add(
    new winston.transports.MongoDB({
      db: "mongodb://localhost/songLibrary",
      level: "error",
    })
  );
};
