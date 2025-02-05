require("dotenv").config();

const MOMO_CONFIG = {
  API_KEY: process.env.MOMO_API_KEY,
  USER_ID: process.env.MOMO_USER_ID,
  PRIMARY_KEY: process.env.MOMO_PRIMARY_KEY,
  ENVIRONMENT: process.env.NODE_ENV === "production" ? "live" : "sandbox",
  COLLECTION_SUBSCRIPTION_KEY: process.env.MOMO_COLLECTION_SUBSCRIPTION_KEY,
  TARGET_ENVIRONMENT:
    process.env.NODE_ENV === "production" ? "live" : "sandbox",
};

// API endpoints based on environment
const BASE_URL =
  MOMO_CONFIG.ENVIRONMENT === "live"
    ? "https://proxy.momoapi.mtn.com"
    : "https://sandbox.momodeveloper.mtn.com";

const API_ENDPOINTS = {
  GET_TOKEN: `${BASE_URL}/collection/token/`,
  REQUEST_TO_PAY: `${BASE_URL}/collection/v1_0/requesttopay`,
  REQUEST_TO_PAY_STATUS: (referenceId) =>
    `${BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
};

module.exports = {
  MOMO_CONFIG,
  API_ENDPOINTS,
};
