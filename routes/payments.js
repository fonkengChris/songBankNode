const express = require("express");
const paypal = require("@paypal/checkout-server-sdk");
const auth = require("../middleware/auth");
const { client } = require("../config/paypal");
const router = express.Router();
const { Payment } = require("../modules/payment");

// Create order endpoint (optional, since frontend handles creation)
router.post("/create-order", auth, async (req, res) => {
  try {
    const { amount, description } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount.toString(),
          },
          description,
        },
      ],
    });

    const order = await client.execute(request);
    res.json({ orderId: order.result.id });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      error: "Failed to create order",
      details: error.message,
    });
  }
});

// Webhook handler for PayPal payment notifications
router.post("/webhook", async (req, res) => {
  try {
    const { event_type, resource } = req.body;

    // Verify webhook signature (recommended in production)
    // const isValid = verifyWebhookSignature(req);
    // if (!isValid) return res.status(400).send('Invalid webhook signature');

    if (event_type === "PAYMENT.CAPTURE.COMPLETED") {
      const order = resource;

      // Create or update payment record
      const payment = new Payment({
        orderId: order.id,
        status: "COMPLETED",
        amount: parseFloat(order.purchase_units[0].amount.value),
        description: order.purchase_units[0].description,
        // You might want to extract userId from custom_id or other metadata
      });

      await payment.save();
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// Verify purchase status
router.get("/verify/:orderId", auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check local database first
    const payment = await Payment.findOne({
      orderId,
      userId: req.user._id,
    });

    if (payment && payment.status === "COMPLETED") {
      return res.json({ status: "COMPLETED" });
    }

    // If not found or not completed, verify with PayPal
    const request = new paypal.orders.OrdersGetRequest(orderId);
    const order = await client.execute(request);

    if (order.result.status === "COMPLETED" && !payment) {
      // Create payment record if it doesn't exist
      const newPayment = new Payment({
        userId: req.user._id,
        orderId,
        status: "COMPLETED",
        amount: parseFloat(order.result.purchase_units[0].amount.value),
        description: order.result.purchase_units[0].description,
      });
      await newPayment.save();
    }

    res.json({ status: order.result.status });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});

// Get user's purchases
router.get("/purchases", auth, async (req, res) => {
  try {
    const purchases = await Payment.find({
      userId: req.user._id,
      status: "COMPLETED",
    }).sort({ createdAt: -1 });

    res.json(purchases.map((p) => p.toResponse()));
  } catch (error) {
    console.error("Failed to fetch purchases:", error);
    res.status(500).json({ error: "Failed to fetch purchases" });
  }
});

module.exports = router;
