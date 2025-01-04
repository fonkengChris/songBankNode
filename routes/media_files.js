const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const mongoose = require("mongoose");
const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();
const path = require("path");
const { SongMediaFile, validate } = require("../modules/song_media_file");
const { Song } = require("../modules/song");

router.use((req, res, next) => {
  console.info(`[info]: Media route accessed: ${req.method} ${req.url}`);
  next();
});

router.get("/", async (req, res) => {
  const mediaFiles = await SongMediaFile.find()
    .populate("song")
    .populate("notation")
    .sort("_id");
  res.send(mediaFiles);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let mediaFile = new SongMediaFile({
    song: req.body.song,
    notation: req.body.notation,
    documentFile: req.body.documentFile,
    audioFile: req.body.audioFile,
    previewImage: req.body.previewImage,
  });
  mediaFile = await mediaFile.save();
  res.send(mediaFile);
});

router.put("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);
  const mediaFile = await SongMediaFile.findByIdAndUpdate(req.params.id, {
    song: req.body.song,
    notation: req.body.notation,
    documentFile: req.body.documentFile,
    audioFile: req.body.audioFile,
    previewImage: req.body.previewImage,
  });

  if (!mediaFile) return res.status(404).send("document_file not found");

  res.send(mediaFile);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const mediaFile = await SongMediaFile.findByIdAndDelete(req.params.id);
  if (!mediaFile) return res.status(404).send("document_file not found");

  res.send(mediaFile);
});

router.get("/:id", [auth, validateObjectId], async (req, res) => {
  try {
    // console.info(
    //   `[info]: Attempting to find mediaFile with ID: ${req.params.id}`
    // );

    const mediaFile = await SongMediaFile.findById(req.params.id)
      .populate("song")
      .populate("notation");

    // console.info(`[info]: MediaFile found: ${JSON.stringify(mediaFile)}`);

    if (!mediaFile) return res.status(404).send("document_file not found");

    const song = await Song.findByIdAndUpdate(mediaFile.song._id, {
      $inc: { views: 1 },
    });

    // console.info(`[info]: Song found: ${JSON.stringify(song)}`);

    if (song) {
      await song.updateMetacritic();
      await song.save();
    }

    res.send(mediaFile);
  } catch (error) {
    console.error(`[error]: Error fetching media file: ${error.message}`);
    console.error(`[error]: Full error: ${error}`);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
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
