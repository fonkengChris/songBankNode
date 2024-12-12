// models/Category.js
const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema({
  title: { type: String, required: true, maxLength: 255 },
});

const Category = mongoose.model("Category", categorySchema);

function validateCategory(category) {
  const schema = Joi.object({
    name: Joi.string().max(50).required(),
  });

  return schema.validate(category);
}

exports.categorySchema = categorySchema;
exports.Category = Category;
exports.validate = validateCategory;
