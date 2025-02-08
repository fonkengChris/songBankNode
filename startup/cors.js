const cors = require("cors");

module.exports = function (app) {
  // console.log("Configuring CORS...");

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  // console.log("Frontend URL:", frontendUrl);

  // Enable debug logging for development
  const isDevelopment = process.env.NODE_ENV !== "production";

  const corsOptions = {
    origin: frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "x-auth-token",
      "X-Reference-Id",
      "X-Target-Environment",
      "Ocp-Apim-Subscription-Key",
    ],
    exposedHeaders: [
      "X-Reference-Id",
      "X-Target-Environment",
      "Ocp-Apim-Subscription-Key",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400, // 24 hours
  };

  // console.log("CORS Options:", JSON.stringify(corsOptions, null, 2));

  // Debug logging middleware
  if (isDevelopment) {
    app.use((req, res, next) => {
      console.log("\nCORS Debug Info:");
      console.log("Origin:", req.headers.origin);
      console.log("Method:", req.method);
      console.log("Headers:", req.headers);

      res.on("finish", () => {
        console.log("\nResponse CORS Headers:");
        console.log(
          "Allow-Origin:",
          res.getHeader("Access-Control-Allow-Origin")
        );
        console.log(
          "Allow-Methods:",
          res.getHeader("Access-Control-Allow-Methods")
        );
        console.log(
          "Allow-Headers:",
          res.getHeader("Access-Control-Allow-Headers")
        );
        console.log(
          "Exposed-Headers:",
          res.getHeader("Access-Control-Expose-Headers")
        );
      });

      next();
    });
  }

  app.use(cors(corsOptions));

  // Handle OPTIONS preflight explicitly
  app.options("*", cors(corsOptions));
  // console.log(
  //   "CORS middleware installed with options:",
  //   JSON.stringify(corsOptions, null, 2)
  // );
};
