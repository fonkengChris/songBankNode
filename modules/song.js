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
  metacritic: { type: Number, default: 0 },
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

  documentFiles: [
    { type: mongoose.Schema.Types.ObjectId, ref: "DocumentSongFile" },
  ],
  audioFile: { type: mongoose.Schema.Types.ObjectId, ref: "AudioSongFile" },
});

songSchema.methods.updateMetacritic = function () {
  //calculate and save the Popularity score
  this.metacritic = this.likesCount * (1 + this.likesCount / this.views) * 100;
};

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
    audioFileId: Joi.objectId(),
    documentFiles: Joi.array().items(Joi.objectId()).min(1),
  });

  return schema.validate(song);
}

exports.songSchema = songSchema;
exports.Song = Song;
exports.validate = validateSong;
