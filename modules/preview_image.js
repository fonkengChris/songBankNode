// models/PreviewImage.js
const mongoose = require("mongoose");

const PreviewImageSchema = new mongoose.Schema({
  previewImage: { type: String, required: true },
  documentFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DocumentSongFile",
    required: true,
  },
});

module.exports = mongoose.model("PreviewImage", PreviewImageSchema);
