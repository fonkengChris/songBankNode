const express = require("express");
const users = require("../routes/users");
const auth = require("../routes/auth");
const songs = require("../routes/songs");
const document_files = require("../routes/document_files");
const audio_files = require("../routes/audio_files");
const customers = require("../routes/customers");
const languages = require("../routes/languages");
const notations = require("../routes/notations");
const categories = require("../routes/categories");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/auth", auth);
  app.use("/api/songs", songs);
  app.use("/api/document_files", document_files);
  app.use("/api/audio_files", audio_files);
  app.use("/api/languages", languages);
  app.use("/api/notations", notations);
  app.use("/api/categories", categories);
  app.use("/api/customers", customers);
  app.use("/api/categories", categories);

  app.use(error);
};
