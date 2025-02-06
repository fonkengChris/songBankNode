const express = require("express");
const router = express.Router();
const { sendContactEmail } = require("../utils/email-service");

router.post("/", async (req, res) => {
  try {
    const { email, name, message } = req.body;

    // Basic validation
    if (!email || !name || !message) {
      return res.status(400).json({
        error: "Please provide email, name, and message",
      });
    }

    await sendContactEmail(email, name, message);

    res.status(200).json({
      message: "Contact message sent successfully",
    });
  } catch (error) {
    console.error("Contact route error:", error);
    res.status(500).json({
      error: "Failed to send contact message",
    });
  }
});

module.exports = router;
