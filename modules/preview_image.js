// models/PreviewImage.js
const mongoose = require('mongoose');

const PreviewImageSchema = new mongoose.Schema({
  preview_image: { type: String, required: true },
  document_song_file: { type: mongoose.Schema.Types.ObjectId, ref: 'DocumentSongFile', required: true },
});

module.exports = mongoose.model('PreviewImage', PreviewImageSchema);
