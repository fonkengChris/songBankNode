// models/SongMediaFile.js
const mongoose = require("mongoose");
const Joi = require("joi");

const songMediaFilesSchema = new mongoose.Schema({
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Song",
    default: null,
  },
  name: { type: String, required: true },
  notation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Notation",
    default: null,
  },
  documentFile: { type: String, required: true },
  audioFile: { type: String, required: true },
  previewImage: { type: String, required: true },
});

const SongMediaFile = mongoose.model("SongMediaFile", songMediaFilesSchema);

function validateSongMediaFile(file) {
  const schema = Joi.object({
    song: Joi.alternatives().try(Joi.objectId(), Joi.valid(null, "")),
    name: Joi.string().required(),
    notation: Joi.objectId().allow(null),
    documentFile: Joi.string().required(),
    audioFile: Joi.string().required(),
    previewImage: Joi.string().required(),
  });

  return schema.validate(file);
}

exports.SongMediaFileSchema = songMediaFilesSchema;
exports.SongMediaFile = SongMediaFile;
exports.validate = validateSongMediaFile;
