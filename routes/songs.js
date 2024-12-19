const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Song, validatePost, validatePut } = require("../modules/song");
const mongoose = require("mongoose");
const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    // Extract query parameters
    const { category, language, notation, sortOrder, searchText } = req.query;

    // Build the aggregation pipeline
    let pipeline = [];

    // Filter on Song model fields
    let songMatch = {};
    if (category) songMatch.category = new mongoose.Types.ObjectId(category);
    if (language) songMatch.language = new mongoose.Types.ObjectId(language);

    // Full-text search if searchText is provided
    if (searchText) {
      songMatch.$text = { $search: searchText };
    }

    if (Object.keys(songMatch).length) {
      pipeline.push({ $match: songMatch });
    }

    // Lookup to join with documentFiles collection
    pipeline.push({
      $lookup: {
        from: "documentsongfiles", // Ensure this matches the actual collection name
        localField: "documentFiles",
        foreignField: "_id",
        as: "documentFiles",
      },
    });

    // If notationId is provided, filter by notationId in the documentFiles array
    if (notation) {
      pipeline.push({ $unwind: "$documentFiles" });
      pipeline.push({
        $match: {
          "documentFiles.notation": new mongoose.Types.ObjectId(notation),
        },
      });
      pipeline.push({
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          slug: { $first: "$slug" },
          authorName: { $first: "$authorName" },
          description: { $first: "$description" },
          lastUpdate: { $first: "$lastUpdate" },
          likesCount: { $first: "$likesCount" },
          lyrics: { $first: "$lyrics" },
          metacritic: { $first: "$metacritic" },
          views: { $first: "$views" },
          language: { $first: "$language" },
          category: { $first: "$category" },
          documentFiles: { $push: "$documentFiles" },
          audioFile: { $first: "$audioFile" },
        },
      });
    }

    // Lookup to join with audioFile collection
    pipeline.push({
      $lookup: {
        from: "audiosongfiles", // Ensure this matches the actual collection name
        localField: "audioFile",
        foreignField: "_id",
        as: "audioFile",
      },
    });

    // Sort the results if sortOrder is provided
    if (req.query.sortOrder) {
      let sortField = req.query.sortOrder;
      let sortDirection = 1; // Default to ascending order

      // If sortOrder starts with "-", interpret it as descending
      if (sortField.startsWith("-")) {
        sortDirection = -1;
        sortField = sortField.substring(1); // Remove the "-" sign to get the field name
      }

      const allowedSortFields = ["title", "metacritic", "last_update"];

      if (allowedSortFields.includes(sortField)) {
        const sortObject = {};
        sortObject[sortField] = sortDirection;
        pipeline.push({ $sort: sortObject });
      } else {
        return res.status(400).send({
          error: `Invalid sort field. Allowed fields: ${allowedSortFields.join(
            ", "
          )}`,
        });
      }
    }

    // Execute the aggregation pipeline
    let songs = await Song.aggregate(pipeline);

    res.send(songs);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "Server error occurred", details: error.message });
  }
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validatePost(req.body);
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
  const { error } = validatePut(req.body);
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
  const song = await Song.findById(req.params.id)
    .populate("documentFiles")
    .populate("audioFile");
  if (!song) return res.status(404).send("song not found");
  res.send(song);
});

module.exports = router;
