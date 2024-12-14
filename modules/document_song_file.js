// models/DocumentSongFile.js
const mongoose = require("mongoose");
const Joi = require("joi");


const documentSongFileSchema = new mongoose.Schema({
  song: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
  notation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notation",
    default: null,
  },
  documentFile: { type: String, required: true },
  previewImage: {
    type: String, // Path or URL to the preview image
    required: true,
  },
});

const DocumentSongFile = mongoose.model(
  "DocumentSongFile",
  documentSongFileSchema
);

function validateDocumentSongFile(file) {
  const schema = Joi.object({
    songId: Joi.objectId().required(),
    notationId: Joi.objectId().required(),
    documentFile: Joi.string().required(),
    previewImage: Joi.string().required(),
  });

  return schema.validate(file);
}

exports.documentSongFileSchema = documentSongFileSchema;
exports.DocumentFile = DocumentSongFile;
exports.validate = validateDocumentSongFile;
