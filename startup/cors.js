const cors = require("cors");

module.exports = function (app) {
  // console.log("Configuring CORS...");

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  // console.log("Frontend URL:", frontendUrl);

  const corsOptions = {
    origin: frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "x-auth-token",
      "Authorization",
      "Accept",
      "Origin",
    ],
    optionsSuccessStatus: 200,
  };

  // console.log("CORS Options:", JSON.stringify(corsOptions, null, 2));

  // Add a middleware to log CORS headers for each request
  app.use((req, res, next) => {
    console.log("\nIncoming request:");
    console.log("Origin:", req.headers.origin);
    console.log("Method:", req.method);

    // Log response headers after CORS middleware processes them
    // res.on("finish", () => {
    //   console.log("\nResponse headers:");
    //   console.log(
    //     "Access-Control-Allow-Origin:",
    //     res.getHeader("Access-Control-Allow-Origin")
    //   );
    //   console.log(
    //     "Access-Control-Allow-Methods:",
    //     res.getHeader("Access-Control-Allow-Methods")
    //   );
    //   console.log(
    //     "Access-Control-Allow-Headers:",
    //     res.getHeader("Access-Control-Allow-Headers")
    //   );
    // });

    next();
  });

  app.use(cors(corsOptions));
  // console.log(
  //   "CORS middleware installed with options:",
  //   JSON.stringify(corsOptions, null, 2)
  // );
};
