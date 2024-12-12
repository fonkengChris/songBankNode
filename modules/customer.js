// models/Customer.js
const mongoose = require("mongoose");
const Joi = require("joi");

const customerSchema = new mongoose.Schema({
  birth_date: { type: Date },
  country: { type: String, default: "EN" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Customer = mongoose.model("Customer", customerSchema);

function validateCustomer(customer) {
  const schema = Joi.object({
    birth_date: Joi.date(),
    country: Joi.string().required(),
    userId: Joi.objectId().required(),
  });

  return schema.validate(customer);
}

exports.customerSchema = customerSchema;
exports.Customer = Customer;
exports.validate = validateCustomer;
