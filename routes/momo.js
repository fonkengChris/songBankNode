const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { MOMO_CONFIG, API_ENDPOINTS } = require("../config/momo");
const { Payment } = require("../modules/payment");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

// Helper function to get access token
async function getMoMoToken() {
  try {
    console.log("Getting MoMo token with config:", {
      environment: MOMO_CONFIG.TARGET_ENVIRONMENT,
      userId: MOMO_CONFIG.USER_ID,
    });

    const response = await axios({
      method: "post",
      url: API_ENDPOINTS.GET_TOKEN,
      headers: {
        "Ocp-Apim-Subscription-Key": MOMO_CONFIG.PRIMARY_KEY,
        "X-Target-Environment": MOMO_CONFIG.TARGET_ENVIRONMENT,
        "Content-Type": "application/json",
        "X-Reference-Id": MOMO_CONFIG.USER_ID,
      },
      auth: {
        username: MOMO_CONFIG.USER_ID,
        password: MOMO_CONFIG.API_KEY,
      },
    });

    if (!response.data.access_token) {
      console.error("No access token in response:", response.data);
      throw new Error("No access token received");
    }

    console.log("Successfully obtained access token");
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting MoMo token:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      url: error.config?.url,
      requestHeaders: {
        ...error.config?.headers,
        Authorization: "(hidden for security)",
      },
    });
    throw new Error(
      `Failed to get access token: ${
        error.response?.data?.message || error.message
      }`
    );
  }
}

// Helper function for currency conversion
function convertAmount(amount, environment) {
  // Exchange rates (you might want to use a real-time API in production)
  const rates = {
    EUR: 0.92, // 1 USD ≈ 0.92 EUR
    XAF: 600, // 1 USD ≈ 600 XAF
  };

  const targetCurrency = environment === "sandbox" ? "EUR" : "XAF";
  const rate = rates[targetCurrency];
  const convertedAmount = Math.round(amount * rate);

  return {
    convertedAmount,
    targetCurrency,
    exchangeRate: rate,
  };
}

// Initialize payment
router.post("/payment", auth, async (req, res) => {
  try {
    const { amount, description, phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        error: "Phone number is required",
        details: "Please provide the customer's phone number",
      });
    }

    // Format phone number (remove leading + or 0 and ensure correct format)
    const formattedPhone = phoneNumber.replace(/^\+|^0+/, "");

    const referenceId = uuidv4();

    // Convert USD based on environment
    const { convertedAmount, targetCurrency, exchangeRate } = convertAmount(
      amount,
      MOMO_CONFIG.TARGET_ENVIRONMENT
    );

    console.log("Payment request initiated:", {
      amount: convertedAmount,
      currency: targetCurrency,
      phone: formattedPhone,
      description,
    });

    // Get access token
    const accessToken = await getMoMoToken();

    // Create payment request
    const paymentRequest = {
      amount: convertedAmount,
      currency: targetCurrency,
      externalId: referenceId,
      payer: {
        partyIdType: "MSISDN",
        partyId: formattedPhone,
      },
      payerMessage: description,
      payeeNote: description,
    };

    // Request payment from MTN MoMo
    const response = await axios.post(
      API_ENDPOINTS.REQUEST_TO_PAY,
      paymentRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": MOMO_CONFIG.TARGET_ENVIRONMENT,
          "Ocp-Apim-Subscription-Key": MOMO_CONFIG.PRIMARY_KEY,
        },
      }
    );

    // Create pending payment record
    const payment = new Payment({
      userId: req.user._id,
      orderId: referenceId,
      amount, // Original USD amount
      description,
      status: "PENDING",
      paymentDetails: {
        purchaseType: "SONG",
        provider: "MTN_MOMO",
        originalAmount: amount,
        originalCurrency: "USD",
        convertedAmount,
        convertedCurrency: targetCurrency,
        exchangeRate,
        phoneNumber: formattedPhone,
      },
    });

    await payment.save();

    res.json({
      status: "PENDING",
      referenceId,
      message:
        "Payment request initiated. Please confirm on your mobile phone.",
      originalAmount: amount,
      convertedAmount,
      currency: targetCurrency,
      phoneNumber: formattedPhone,
    });
  } catch (error) {
    console.error("MoMo payment error:", error);
    res.status(500).json({
      error: "Failed to initiate payment",
      details: error.response?.data?.message || error.message,
    });
  }
});

// Check payment status
router.get("/status/:referenceId", auth, async (req, res) => {
  try {
    const { referenceId } = req.params;
    const accessToken = await getMoMoToken();

    const response = await axios.get(
      API_ENDPOINTS.REQUEST_TO_PAY_STATUS(referenceId),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Target-Environment": MOMO_CONFIG.TARGET_ENVIRONMENT,
          "Ocp-Apim-Subscription-Key": MOMO_CONFIG.PRIMARY_KEY,
        },
      }
    );

    // Update payment status in database
    if (response.data.status === "SUCCESSFUL") {
      await Payment.findOneAndUpdate(
        { orderId: referenceId },
        { status: "COMPLETED" }
      );
    }

    res.json(response.data);
  } catch (error) {
    console.error("MoMo status check error:", error);
    res.status(500).json({
      error: "Failed to check payment status",
      details: error.message,
    });
  }
});

// Helper function to poll payment status
async function pollPaymentStatus(referenceId) {
  try {
    const accessToken = await getMoMoToken();
    const response = await axios.get(
      API_ENDPOINTS.REQUEST_TO_PAY_STATUS(referenceId),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Target-Environment": MOMO_CONFIG.TARGET_ENVIRONMENT,
          "Ocp-Apim-Subscription-Key": MOMO_CONFIG.PRIMARY_KEY,
        },
      }
    );
    return response.data.status;
  } catch (error) {
    console.error("Error polling payment status:", error);
    return null;
  }
}

module.exports = router;
