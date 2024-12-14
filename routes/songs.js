const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Song, validate } = require("../modules/song");
const mongoose = require("mongoose");
const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

router.get("/", async (req, res) => {
  const songs = await Song.find().sort("title");
  res.send(songs);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let song = new Song({
    title: req.body.title,
    slug: req.body.slug,
    authorName: req.body.authorName,
    description: req.body.description,
    lastUpdate: req.body.lastUpdate,
    lyrics: req.body.lyrics,
    language: req.body.language,
    category: req.body.category,
    documentFiles: req.body.documentFiles,
    audioFile: req.body.audioFile,
  });
  song = await song.save();
  res.send(song);
});

router.put("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);
  const song = await Song.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      slug: req.body.slug,
      authorName: req.body.authorName,
      description: req.body.description,
      lastUpdate: req.body.lastUpdate,
      lyrics: req.body.lyrics,
      language: req.body.language,
      category: req.body.category,
      documentFiles: req.body.documentFiles,
      audioFile: req.body.audioFile,
    },
    { new: true }
  );

  if (!song) return res.status(404).send("song not found");

  res.send(song);
});

router.patch("/:id", [auth, validateObjectId], async (req, res) => {
  const song = await Song.findByIdAndUpdate(
    req.params.id,
    {
      views: req.body.views,
      likesCount: req.body.likesCount,
    },
    { new: true }
  );
  song.updateMetacritic();

  if (!song) return res.status(404).send("song not found");

  res.send(song);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const song = await Song.findByIdAndDelete(req.params.id);
  if (!song) return res.status(404).send("song not found");

  res.send(song);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const song = await Song.findById(req.params.id);
  if (!song) return res.status(404).send("song not found");
  res.send(song);
});

module.exports = router;
