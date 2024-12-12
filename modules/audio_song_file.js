// models/DocumentSongFile.js
const mongoose = require("mongoose");
const Joi = require("joi");

const audioSongFileSchema = new mongoose.Schema({
  song: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
  audio_file: { type: String, required: true },
});

const AudioSongFile = mongoose.model("DocumentSongFile", audioSongFileSchema);

function validateAudioSongFile(file) {
  const schema = Joi.object({
    songId: Joi.objectId().required(),
    audioSongFileSchema_file: Joi.string().required(),
  });

  return schema.validate(file);
}

exports.audioSongFileSchema = audioSongFileSchema;
exports.AudioSongFile = AudioSongFile;
exports.validate = validateAudioSongFile;
