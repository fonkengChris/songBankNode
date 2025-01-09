const cors = require("cors");

module.exports = function (app) {
  const corsOptions = {
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Authorization", "x-auth-token"],
    exposedHeaders: ["x-auth-token"],
  };

  // Apply CORS
  app.use(cors(corsOptions));
};
