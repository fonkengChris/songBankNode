const dotenv = require("dotenv");
dotenv.config();

const isProd = process.env.NODE_ENV === "production";

// Validate required environment variables
const requiredVars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
requiredVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`WARNING: ${varName} is not set!`);
  }
});

// Add console.log to verify the client ID being used
console.log("Using Google Client ID:", process.env.GOOGLE_CLIENT_ID);

// Set the correct callback URL based on environment
const callbackURL = isProd
  ? "https://sheet-music-library-ad225c202768.herokuapp.com/api/auth/google/callback"
  : process.env.GOOGLE_CALLBACK_URL;

module.exports = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: callbackURL,
  isProd,
};
