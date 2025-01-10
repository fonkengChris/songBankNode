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
const passwordReset = require("../routes/password-reset");

module.exports = function (app) {
<<<<<<< HEAD
  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Debug middleware for routes
  // app.use((req, res, next) => {
  //   console.log("\n=== Route Handler ===");
  //   console.log("Headers before route:", res.getHeaders());
  //   next();
  // });

  // API routes
=======
  // app.use(express.json());
>>>>>>> 945c8294543076a0cb6589af7ad545e2b4e656b4
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
  app.use("/api/auth/password-reset", passwordReset);

  // Static files
  app.use("/media", express.static(path.join(__dirname, "../media")));

  // Error handling middleware
  app.use(error);
};
