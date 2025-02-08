require("dotenv").config();

const MOMO_CONFIG = {
  API_KEY: process.env.MOMO_API_KEY,
  USER_ID: process.env.MOMO_USER_ID,
  PRIMARY_KEY: process.env.MOMO_PRIMARY_KEY,
  // TODO: Change this to "mtncameroon" when going live
  // Currently using "sandbox" for testing in all environments
  TARGET_ENVIRONMENT: "sandbox",
};

// TODO: Update BASE_URL when going live
// Production URL should be: https://proxy.momoapi.mtn.cm
// Currently using sandbox URL for testing
const BASE_URL = "https://sandbox.momodeveloper.mtn.com";

const API_ENDPOINTS = {
  GET_TOKEN: `${BASE_URL}/collection/token/`,
  REQUEST_TO_PAY: `${BASE_URL}/collection/v1_0/requesttopay`,
  REQUEST_TO_PAY_STATUS: (referenceId) =>
    `${BASE_URL}/collection/v1_0/requesttopay/${referenceId}`,
};

// TODO: Before going live:
// 1. Change TARGET_ENVIRONMENT to "mtncameroon"
// 2. Update BASE_URL to production URL
// 3. Update PRIMARY_KEY to production subscription key
// 4. Test with real MTN mobile money accounts
// 5. Update currency conversion to use XAF instead of EUR

module.exports = {
  MOMO_CONFIG,
  API_ENDPOINTS,
};
