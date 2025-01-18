const express = require("express");
const paypal = require("@paypal/checkout-server-sdk");
const auth = require("../middleware/auth");
const { client } = require("../config/paypal");
const router = express.Router();
const Payment = require("../modules/payment");

// Record payment in database
router.post("/", auth, async (req, res) => {
  try {
    const { orderId, status, amount, description } = req.body;
    const userId = req.user._id;

    // Verify the payment with PayPal
    const request = new paypal.orders.OrdersGetRequest(orderId);
    const order = await client.execute(request);

    // Validate payment amount and status
    const paypalAmount = order.result.purchase_units[0].amount.value;
    if (paypalAmount !== amount.toString() || order.result.status !== status) {
      return res.status(400).json({
        error: "Payment verification failed",
        details: "Payment amount or status mismatch",
      });
    }

    const payment = new Payment({
      userId,
      orderId,
      amount,
      description,
      status,
    });

    await payment.save();

    // Return response in the format expected by the frontend
    res.status(200).json(payment.toResponse());
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({
      error: "Failed to process payment",
      details: error.message,
    });
  }
});

// Get user's payment history
router.get("/history", auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(payments.map((payment) => payment.toResponse()));
  } catch (error) {
    console.error("Failed to fetch payment history:", error);
    res.status(500).json({
      error: "Failed to fetch payment history",
      details: error.message,
    });
  }
});

// Get payment details
router.get("/:orderId", auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      orderId: req.params.orderId,
      userId: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    const request = new paypal.orders.OrdersGetRequest(req.params.orderId);
    const order = await client.execute(request);

    res.json({
      ...payment.toResponse(),
      paypalDetails: order.result,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      error: "Failed to verify payment",
      details: error.message,
    });
  }
});

module.exports = router;
