const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { DocumentFile, validate } = require("../modules/document_song_file");
const mongoose = require("mongoose");
const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const preview_image = require("../modules/preview_image");
const router = express.Router();

router.get("/", async (req, res) => {
  const document_files = await DocumentFile.find().sort("_id");
  res.send(document_files);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let document_file = new DocumentFile({
    song: req.body.song,
    notation: req.body.notation,
    documentFile: req.body.documentFile,
    previewImage: req.body.previewImage,
  });
  document_file = await document_file.save();
  res.send(document_file);
});

router.put("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);
  const document_file = await DocumentFile.findByIdAndUpdate(req.params.id, {
    song: req.body.song,
    notation: req.body.notation,
    documentFile: req.body.documentFile,
    previewImage: req.body.previewImage,
  });

  if (!document_file) return res.status(404).send("document_file not found");

  res.send(document_file);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const document_file = await DocumentFile.findByIdAndDelete(req.params.id);
  if (!document_file) return res.status(404).send("document_file not found");

  res.send(document_file);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const document_file = await DocumentFile.findById(req.params.id);
  if (!document_file) return res.status(404).send("document_file not found");
  res.send(document_file);
});

module.exports = router;
