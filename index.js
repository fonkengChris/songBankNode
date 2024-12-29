const winston = require("winston");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: "http://127.0.0.1:5173", // Allow the frontend origin
    // origin: "*", // Allow the frontend origin
    methods: ["GET", "POST", "PATCH", "DELETE"], // Include PATCH method
    allowedHeaders: ["Content-Type", "X-Auth-Token"], // Include necessary headers
  })
);

app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Auth-Token");
  res.sendStatus(200);
});

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
