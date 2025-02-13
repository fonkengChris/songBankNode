const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../modules/user");
const { OAuth2Client } = require("google-auth-library");
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} = require("../config/google-auth");
const { sendWelcomeEmail } = require("../utils/email-service");

// Create OAuth2Client after importing GOOGLE_CLIENT_ID
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const router = express.Router();

// Add console.log to debug the values
// console.log("OAuth Config:", {
//   clientID: GOOGLE_CLIENT_ID,
//   clientSecret: GOOGLE_CLIENT_SECRET,
//   callbackURL: GOOGLE_CALLBACK_URL,
// });

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Create new user if doesn't exist
          user = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            picture: profile.photos[0].value,
            password: Math.random().toString(36).slice(-8), // Random password for Google users
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Google auth routes
router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    const token = req.user.generateAccessToken();
    res.redirect(`/auth-success?token=${token}`);
  }
);

// Add these new routes to your existing router
router.post("/google-login", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      // Create new user if they don't exist
      user = new User({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        picture: payload.picture,
        password: Math.random().toString(36).slice(-8), // Random password for Google users
        isAdmin: false,
      });
      await user.save();

      // Send welcome email for new users
      try {
        await sendWelcomeEmail(user.email, user.name);
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // Continue with login even if email fails
      }
    }

    // Generate JWT token
    const accessToken = user.generateAccessToken();

    res.send({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Google login error:", error);

    // More specific error handling
    if (error.message.includes("Token used too late")) {
      return res
        .status(401)
        .json({ message: "Token expired. Please try logging in again." });
    }

    if (error.message.includes("Invalid token")) {
      return res
        .status(401)
        .json({ message: "Invalid token. Please try logging in again." });
    }

    res.status(401).json({
      message: "Authentication failed",
      error: error.message,
      details: {
        name: error.name,
        message: error.message,
      },
    });
  }
});

router.post("/google-register", async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });

    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    user = new User({
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      googleId: payload.sub,
      password: Math.random().toString(36).slice(-8),
    });

    await user.save();

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Continue with registration even if email fails
    }

    const accessToken = user.generateAccessToken();

    res.send({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Google registration error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
