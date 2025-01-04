const winston = require("winston");
const express = require("express");
const app = express();

// Add this line for debugging
// app.use((req, res, next) => {
//   res.on("finish", () => {
//     console.log("Response Headers:", res.getHeaders());
//   });
//   next();
// });

// CORS must be first
require("./startup/cors")(app);

// Then body parser
app.use(express.json());

// Then other middleware
require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db-connection")();
require("./startup/config")();
require("./startup/validation")();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  winston.info(`Listening at port ${port}...`);
});

module.exports = server;
