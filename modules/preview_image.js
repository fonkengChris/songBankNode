// models/PreviewImage.js
const mongoose = require("mongoose");
const Joi = require("joi");

const PreviewImageSchema = new mongoose.Schema({
  previewImage: { type: String, required: true },
  documentFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DocumentSongFile",
  },
});

const PreviewImage = mongoose.model("PreviewImage", PreviewImageSchema);

function validateImage(image) {
  const schema = Joi.object({
    previewImage: Joi.string().max(255).required(),
    documentFile: Joi.string(),
  });

  return schema.validate(image);
}

exports.PreviewImage = PreviewImage;
exports.validate = validateImage;
