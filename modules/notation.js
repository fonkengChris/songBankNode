// models/Notation.js
const mongoose = require("mongoose");
const Joi = require("joi");

const notationSchema = new mongoose.Schema({
  title: { type: String, required: true, maxLength: 255 },
  slug: { type: String, required: true, maxLength: 70, unique: true },
});

const Notation = mongoose.model("Notation", notationSchema);

function validateNotation(notation) {
  const schema = Joi.object({
    title: Joi.string().max(255).required(),
    slug: Joi.string().max(70).required(),
  });

  return schema.validate(notation);
}

exports.notationSchema = notationSchema;
exports.Notation = Notation;
exports.validate = validateNotation;
