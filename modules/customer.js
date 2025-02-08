// models/Customer.js
const mongoose = require("mongoose");
const Joi = require("joi");

const customerSchema = new mongoose.Schema({
  country: { type: String, default: "EN" },
  phone_number: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Customer = mongoose.model("Customer", customerSchema);

function validateCustomerPost(customer) {
  const schema = Joi.object({
    phone_number: Joi.string(),
    country: Joi.string().required(),
    user: Joi.objectId().required(),
  });

  return schema.validate(customer);
}

function validateCustomerPut(customer) {
  const schema = Joi.object({
    phone_number: Joi.string(),
    country: Joi.string(),
    user: Joi.objectId(),
  });

  return schema.validate(customer);
}

exports.customerSchema = customerSchema;
exports.Customer = Customer;
exports.validatePost = validateCustomerPost;
exports.validatePut = validateCustomerPut;
