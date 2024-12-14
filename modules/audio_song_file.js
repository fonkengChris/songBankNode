// models/DocumentSongFile.js
const mongoose = require("mongoose");
const Joi = require("joi");

const audioSongFileSchema = new mongoose.Schema({
  song: { type: mongoose.Schema.Types.ObjectId, ref: "Song", required: true },
  audioFile: { type: String, required: true },
});

const AudioSongFile = mongoose.model("AudioSongFile", audioSongFileSchema);

function validateAudioSongFile(file) {
  const schema = Joi.object({
    songId: Joi.objectId().required(),
    audioFile: Joi.string().required(),
  });

  return schema.validate(file);
}

exports.audioSongFileSchema = audioSongFileSchema;
exports.AudioFile = AudioSongFile;
exports.validate = validateAudioSongFile;
