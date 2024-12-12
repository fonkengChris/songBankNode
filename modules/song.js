// models/Song.js
const mongoose = require("mongoose");
const Joi = require("joi");

const songSchema = new mongoose.Schema({
  title: { type: String, required: true, maxLength: 255 },
  slug: { type: String, required: true, unique: true },
  authorName: { type: String, default: "Unknown", maxLength: 255 },
  description: { type: String },
  lastUpdate: { type: Date, default: Date.now },
  likesCount: { type: Number, default: 0 },
  lyrics: { type: String },
  metacritic: { type: Number },
  views: { type: Number, default: 0 },
  language: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Language",
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },

  document_files: [
    { type: mongoose.Schema.Types.ObjectId, ref: "DocumentSongFile" },
  ],
  audio_file: { type: mongoose.Schema.Types.ObjectId, ref: "AudioSongFile" },
});

const Song = mongoose.model("Song", songSchema);

function validateSong(song) {
  const schema = Joi.object({
    title: Joi.string().max(255).required(),
    slug: Joi.string().max(255).required(),
    authorName: Joi.string().max(255).required(),
    description: Joi.string(),
    lastUpdate: Joi.date(),
    likesCount: Joi.number(),
    lyrics: Joi.string(),
    metacritic: Joi.number(),
    views: Joi.number(),
    languageId: Joi.objectId().required(),
    categoryId: Joi.objectId().required(),
    audioFileId: Joi.objectId().required(),
    documentFiles: Joi.array().items(Joi.objectId()).min(1).required(),
  });

  return schema.validate(song);
}

exports.songSchema = songSchema;
exports.Song = Song;
exports.validate = validateSong;
