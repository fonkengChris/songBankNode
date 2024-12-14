const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { AudioFile, validate } = require("../modules/audio_song_file");
const mongoose = require("mongoose");
const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

router.get("/", async (req, res) => {
  const audio_files = await AudioFile.find().sort("_id");
  res.send(audio_files);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let audio_file = new AudioFile({
    song: req.body.song,
    audioFile: req.body.audioFile,
  });
  audio_file = await audio_file.save();
  res.send(audio_file);
});

router.put("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);
  const audio_file = await AudioFile.findByIdAndUpdate(req.params.id, {
    song: req.body.song,
    audioFile: req.body.audioFile,
  });

  if (!audio_file) return res.status(404).send("audio_file not found");

  res.send(audio_file);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const audio_file = await AudioFile.findByIdAndDelete(req.params.id);
  if (!audio_file) return res.status(404).send("audio_file not found");

  res.send(audio_file);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const audio_file = await AudioFile.findById(req.params.id);
  if (!audio_file) return res.status(404).send("audio_file not found");
  res.send(audio_file);
});

module.exports = router;
