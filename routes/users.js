const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validatePost, validatePut, ROLES } = require("../modules/user");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const users = await User.find().sort("name");
  res.send(users);
});

router.get("/me", auth, (req, res) => {
  const token = req.header("x-auth-token");
  const user = jwt.decode(token);
  // const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validatePost(req.body);
  if (error) return res.status(400).send(error.message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already exists");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAccessToken();
  const ref = user.generateRefreshToken();

  // Set the refresh token as an HTTP-only cookie
  res.cookie("refresh-token", ref, {
    httpOnly: true, // Prevents JavaScript access to the cookie
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    sameSite: "strict", // Protects against CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration set to 7 days
  });

  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email", "isAdmin"]));
});

router.get("/:id", [auth, admin], async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return res.status(404).send("User not found.");

  res.send(user);
});

router.put("/:id", [auth], async (req, res) => {
  const { error } = validatePut(req.body);
  if (error) return res.status(400).send(error.message);

  // Check if user is updating their own profile
  const isSelfUpdate = req.params.id === req.user._id;
  const isAdmin = req.user.role === ROLES.ADMIN;
  const isSuperAdmin = req.user.role === ROLES.SUPER_ADMIN;

  if (!isSelfUpdate && !isAdmin && !isSuperAdmin) {
    return res.status(403).send("Access denied.");
  }

  try {
    let updateData = _.pick(req.body, ["name", "email"]);

    // Only allow role updates by super admins
    if (isSuperAdmin && req.body.role) {
      updateData.role = req.body.role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!user) return res.status(404).send("User not found.");
    res.send(user);
  } catch (ex) {
    res.status(400).send("Invalid update request.");
  }
});

router.delete("/:id", [auth], async (req, res) => {
  const isSelfDelete = req.params.id === req.user._id;
  const isAdmin = req.user.role === ROLES.ADMIN;
  const isSuperAdmin = req.user.role === ROLES.SUPER_ADMIN;

  if (!isSelfDelete && !isAdmin && !isSuperAdmin) {
    return res.status(403).send("Access denied.");
  }

  // Only super admins can delete admins
  const userToDelete = await User.findById(req.params.id);
  if (!userToDelete) return res.status(404).send("User not found.");

  if (userToDelete.role === ROLES.ADMIN && !isSuperAdmin) {
    return res.status(403).send("Only super admins can delete admin users.");
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id).select(
      "-password"
    );

    if (isSelfDelete) {
      res.clearCookie("refresh-token");
      res.header("x-auth-token", "");
    }

    res.send(user);
  } catch (ex) {
    res.status(400).send("Invalid delete request.");
  }
});

module.exports = router;
