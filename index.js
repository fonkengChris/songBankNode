const winston = require("winston");
const express = require("express");
const app = express();

// CORS setup should be one of the first middleware
require("./startup/cors")(app);

// Routes and other middleware
require("./startup/routes")(app);
require("./startup/logging")();
require("./startup/db-connection")();
require("./startup/config")();
require("./startup/validation")();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  winston.info(`Listening at port ${port}...`);
});

module.exports = server;
