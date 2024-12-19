const express = require("express");
const users = require("../routes/users");
const auth = require("../routes/auth");
const songs = require("../routes/songs");
const document_files = require("../routes/document_files");
const audio_files = require("../routes/audio_files");
const image_files = require("../routes/preview_images");
const customers = require("../routes/customers");
const languages = require("../routes/languages");
const notations = require("../routes/notations");
const categories = require("../routes/categories");
const error = require("../middleware/error");
const path = require("path");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/songs", songs);
  app.use("/api/documents", document_files);
  app.use("/api/audios", audio_files);
  app.use("/api/images", image_files);
  app.use("/api/languages", languages);
  app.use("/api/notations", notations);
  app.use("/api/categories", categories);
  app.use("/api/customers", customers);
  app.use("/api/categories", categories);
  app.use("/media", express.static(path.join(__dirname, "../media")));

  app.use(error);
};
