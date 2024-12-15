const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { PreviewImage, validate } = require("../modules/preview_image");
const mongoose = require("mongoose");
const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const preview_image = require("../modules/preview_image");
const router = express.Router();
const path = require("path");

router.get("/", async (req, res) => {
  const preview_images = await PreviewImage.find().sort("_id");
  res.send(preview_images);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let preview_image = new PreviewImage({
    documentFile: req.body.documentFile,
    previewImage: req.body.previewImage,
  });
  preview_image = await preview_image.save();
  res.send(preview_image);
});

router.put("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);
  const preview_image = await PreviewImage.findByIdAndUpdate(req.params.id, {
    documentFile: req.body.documentFile,
    previewImage: req.body.previewImage,
  });

  if (!preview_image) return res.status(404).send("preview_image not found");

  res.send(preview_image);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const preview_image = await PreviewImage.findByIdAndDelete(req.params.id);
  if (!preview_image) return res.status(404).send("preview_image not found");

  res.send(preview_image);
});

router.get("/:type/:filename", validateObjectId, async (req, res) => {
  const { type, filename } = req.params;
  const filePath = path.join(__dirname, "../media", type, filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(err.status || 500).send("File not found or cannot be served.");
    }
  });
});

module.exports = router;
