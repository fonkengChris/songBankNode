const winston = require("winston");
const express = require("express");
const dotenv = require("dotenv");
const app = express();

// Load environment variables
dotenv.config();

require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db-connection")();
require("./startup/config")();
require("./startup/validation")();
// require("./startup/prod")(app);

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  winston.info(`Listening at port ${port}...`);
});

module.exports = server;


