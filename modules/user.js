const Joi = require("joi");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity");
const mongoose = require("mongoose");

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
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  picture: {
    type: String,
  },
  resetToken: {
    type: String,
    sparse: true,
  },
  resetTokenExpiry: {
    type: Date,
    sparse: true,
  },
});

//Generate access token
userSchema.methods.generateAccessToken = function () {
  const payload = {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
  };

  return jwt.sign(payload, process.env.JWT_PRIVATE_KEY, { expiresIn: "24h" });
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
