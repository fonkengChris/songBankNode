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
    // Create Basic auth token from USER_ID and API_KEY
    const auth = Buffer.from(
      `${MOMO_CONFIG.USER_ID}:${MOMO_CONFIG.API_KEY}`
    ).toString("base64");

    const response = await axios.post(
      API_ENDPOINTS.GET_TOKEN,
      {},
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Ocp-Apim-Subscription-Key": MOMO_CONFIG.PRIMARY_KEY, // This is the Subscription Key
          "X-Target-Environment": MOMO_CONFIG.TARGET_ENVIRONMENT,
        },
      }
    );

    console.log("Token response:", response.data);
    return response.data.access_token;
  } catch (error) {
    console.error("Error getting MoMo token:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: {
        url: error.config?.url,
        headers: {
          ...error.config?.headers,
          Authorization: "(hidden for security)",
        },
      },
    });
    throw error;
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
    const { amount, description } = req.body;
    const referenceId = uuidv4();

    // Convert USD based on environment
    const { convertedAmount, targetCurrency, exchangeRate } = convertAmount(
      amount,
      MOMO_CONFIG.TARGET_ENVIRONMENT
    );

    // Get access token
    const accessToken = await getMoMoToken();

    // Create payment request
    const paymentRequest = {
      amount: convertedAmount,
      currency: targetCurrency,
      externalId: referenceId,
      payer: {
        partyIdType: "MSISDN",
        partyId: "46733123453", // This should come from the client
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
      },
    });

    await payment.save();

    res.json({
      status: "PENDING",
      referenceId,
      message:
        "Payment request initiated. Please confirm the payment on your mobile device.",
      originalAmount: amount,
      convertedAmount,
      currency: targetCurrency,
      statusCheckUrl: `/api/momo/status/${referenceId}`, // URL for status checking
    });

    // Optional: Start polling for status updates
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = setInterval(async () => {
      attempts++;
      const status = await pollPaymentStatus(referenceId);

      if (status === "SUCCESSFUL") {
        await Payment.findOneAndUpdate(
          { orderId: referenceId },
          { status: "COMPLETED" }
        );
        clearInterval(pollInterval);
      } else if (status === "FAILED" || status === "REJECTED") {
        await Payment.findOneAndUpdate(
          { orderId: referenceId },
          { status: "VOIDED" }
        );
        clearInterval(pollInterval);
      } else if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 5 seconds
  } catch (error) {
    console.error("MoMo payment error:", error);
    res.status(500).json({
      error: "Failed to initiate payment",
      details: error.message,
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
