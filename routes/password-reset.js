const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const { User, validatePost } = require("../modules/user");
const { sendPasswordResetEmail } = require("../utils/email-service");
const router = express.Router();

// Request password reset
router.post("/request-reset", async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debug log
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

      user.resetToken = resetToken;
      user.resetTokenExpiry = resetTokenExpiry;
      await user.save();

      try {
        await sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        return res.status(500).send("Failed to send reset email");
      }
    }

    // Always return success for security
    res.status(200).send("If the email exists, a reset link has been sent.");
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    console.log("Received token:", token); // Debug log
    console.log("Received password:", !!password); // Debug log

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    console.log("Found user:", user); // Debug log
    console.log("Current time:", Date.now()); // Debug log
    if (user) {
      console.log("Token expiry:", user.resetTokenExpiry); // Debug log
    }

    if (!user) {
      return res.status(400).send("Invalid or expired reset token");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).send("Password successfully reset");
  } catch (error) {
    console.error("Reset password error:", error); // Debug log
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;