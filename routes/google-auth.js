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
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);

    // Verify the token with explicit audience check
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID, // Must match exactly with your Client ID
    });

    const payload = ticket.getPayload();
    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = new User({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        picture: payload.picture,
        isAdmin: false,
      });
      await user.save();
    }

    // Generate JWT token
    const authToken = user.generateAuthToken();
    res.send({ token: authToken });
  } catch (error) {
    // Send detailed error information that will show in browser console
    res.status(401).json({
      message: "Invalid token",
      details: error.message,
      clientId: GOOGLE_CLIENT_ID, // This will help verify the client ID being used
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });
  }
});

router.post("/google-register", async (req, res) => {
  try {
    const { token } = req.body;

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({ email: payload.email });

    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create new user
    user = new User({
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      googleId: payload.sub,
      password: Math.random().toString(36).slice(-8), // Random password for Google users
    });

    await user.save();

    // Generate JWT token
    const accessToken = user.generateAccessToken();

    res.json({ accessToken });
  } catch (error) {
    console.error("Google registration error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
