const Joi = require("joi");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Environment variables for secret keys and token expirations
const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || "your-access-token-secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your-refresh-token-secret";
const ACCESS_TOKEN_EXPIRY = "15m"; // Access token expires in 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d"; // Refresh token expires in 7 days

dotenv.config();

const complexityOptions = {
  min: 8,
  max: 1024,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1,
  requirementCount: 4,
};

// Add role enum constant
const ROLES = {
  REGULAR: "regular",
  ADMIN: "admin",
  SUPER_ADMIN: "superAdmin",
};

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024,
  },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.REGULAR,
    required: true,
  },
});

//Generate access token
userSchema.methods.generateAccessToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );
  return token;
};

//Generate refresh token
userSchema.methods.generateRefreshToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      role: this.role,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    }
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUserPost(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(255).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: passwordComplexity(complexityOptions).required(),
  });

  return schema.validate(user);
}

function validateUserPut(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(255).required(),
    email: Joi.string().min(5).max(255).required().email(),
    role: Joi.string().valid(...Object.values(ROLES)),
  });

  return schema.validate(user);
}

// Export ROLES enum
exports.ROLES = ROLES;
exports.User = User;
exports.validatePost = validateUserPost;
exports.validatePut = validateUserPut;
