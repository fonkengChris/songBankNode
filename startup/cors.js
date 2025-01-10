const cors = require("cors");

module.exports = function (app) {
  const corsOptions = {
    origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "x-auth-token",
      "Accept",
      "Accept-Encoding",
      "Accept-Language",
      "Connection",
      "Cookie",
      "Host",
      "Origin",
      "Referer",
      "Sec-Fetch-Dest",
      "Sec-Fetch-Mode",
      "Sec-Fetch-Site",
      "User-Agent",
      "sec-ch-ua",
      "sec-ch-ua-mobile",
      "sec-ch-ua-platform",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    maxAge: 3600,
  };

  app.use(cors(corsOptions));
};
