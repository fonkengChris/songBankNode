// models/Language.js
const mongoose = require("mongoose");
const Joi = require("joi");

const languageSchema = new mongoose.Schema({
  name: { type: String, required: true, maxLength: 255 },
  code: { type: String, required: true, maxLength: 10 },
});

const Language = mongoose.model("Language", languageSchema);

function validateLanguage(language) {
  const schema = Joi.object({
    name: Joi.string().max(255).required(),
    code: Joi.string().max(10).required(),
  });

  return schema.validate(language);
}

exports.languageSchema = languageSchema;
exports.Language = Language;
exports.validate = validateLanguage;
