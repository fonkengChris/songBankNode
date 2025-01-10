const dotenv = require("dotenv");
dotenv.config();

// Add debugging
console.log("Google Auth Config:", {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
});

if (!process.env.GOOGLE_CLIENT_ID) {
  console.error("WARNING: GOOGLE_CLIENT_ID is not set!");
}

module.exports = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
};
