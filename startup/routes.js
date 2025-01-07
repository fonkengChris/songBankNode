const express = require("express");
const users = require("../routes/users");
const auth = require("../routes/auth");
const change_password = require("../routes/change_password");
const songs = require("../routes/songs");
const media_files = require("../routes/media_files");
const audio_files = require("../routes/audio_files");
const image_files = require("../routes/preview_images");
const customers = require("../routes/customers");
const languages = require("../routes/languages");
const notations = require("../routes/notations");
const categories = require("../routes/categories");
const error = require("../middleware/error");
const path = require("path");
const googleAuth = require("../routes/google-auth");

module.exports = function (app) {
  app.use(express.json());

  // API routes
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/change_password", change_password);
  app.use("/api/songs", songs);
  app.use("/api/media_files", media_files);
  app.use("/api/audios", audio_files);
  app.use("/api/images", image_files);
  app.use("/api/languages", languages);
  app.use("/api/notations", notations);
  app.use("/api/categories", categories);
  app.use("/api/customers", customers);
  app.use("/api/auth/google", googleAuth);

  // Static files
  app.use("/media", express.static(path.join(__dirname, "../media")));

  // Error handling should be last
  app.use(error);
};
