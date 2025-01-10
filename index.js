const winston = require("winston");
const express = require("express");
const app = express();

<<<<<<< HEAD
// CORS setup should be one of the first middleware
require("./startup/cors")(app);

// Routes and other middleware
=======
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
>>>>>>> 945c8294543076a0cb6589af7ad545e2b4e656b4
require("./startup/routes")(app);
require("./startup/logging")();
require("./startup/db-connection")();
require("./startup/config")();
require("./startup/validation")();
<<<<<<< HEAD

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});
=======
>>>>>>> 945c8294543076a0cb6589af7ad545e2b4e656b4

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  winston.info(`Listening at port ${port}...`);
});

module.exports = server;
