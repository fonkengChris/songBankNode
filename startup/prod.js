const helmet = require("helmet");
const compression = require("compression");

module.exports = function (app) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  // ... existing code ...
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          connectSrc: ["'self'", frontendUrl, "https://accounts.google.com"],
          scriptSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://accounts.google.com",
          ],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: [
            "'self'",
            "data:",
            "blob:",
            "https://*.googleusercontent.com",
          ],
          fontSrc: ["'self'", "data:"],
          formAction: ["'self'", "https://accounts.google.com"],
          frameAncestors: ["'none'"],
          frameSrc: ["'self'", "https://accounts.google.com"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
    })
  );
  // ... existing code ...
  app.use(compression());
};
