const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Song, validatePost, validatePut } = require("../modules/song");
const mongoose = require("mongoose");
const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { category, language, notation, sortOrder, searchText } = req.query;

    // Build the aggregation pipeline
    let pipeline = [];

    // Filter based on category and language
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

    // Lookup mediaFiles
    pipeline.push({
      $lookup: {
        from: "songmediafiles", // Collection name in MongoDB
        localField: "mediaFiles",
        foreignField: "_id",
        as: "mediaFiles",
      },
    });

    // Unwind mediaFiles to allow individual filtering
    pipeline.push({
      $unwind: {
        path: "$mediaFiles",
        preserveNullAndEmptyArrays: false, // Remove songs without mediaFiles
      },
    });

    // Filter mediaFiles by notation if provided
    if (notation) {
      pipeline.push({
        $match: {
          "mediaFiles.notation": new mongoose.Types.ObjectId(notation),
        },
      });
    }

    // Re-group songs back together with filtered mediaFiles
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
        mediaFiles: { $push: "$mediaFiles" }, // Aggregate only filtered mediaFiles
        audioFile: { $first: "$audioFile" },
        languageOverride: { $first: "$languageOverride" },
      },
    });

    // Lookup language
    pipeline.push({
      $lookup: {
        from: "languages",
        localField: "language",
        foreignField: "_id",
        as: "language",
      },
    });

    // Unwind language to simplify structure
    pipeline.push({
      $unwind: {
        path: "$language",
        preserveNullAndEmptyArrays: true,
      },
    });

    // Lookup category
    pipeline.push({
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "category",
      },
    });

    // Unwind category to simplify structure
    pipeline.push({
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    });

    // Sorting logic
    if (sortOrder) {
      let sortField = sortOrder;
      let sortDirection = 1;

      if (sortField.startsWith("-")) {
        sortDirection = -1;
        sortField = sortField.substring(1);
      }

      const allowedSortFields = ["title", "metacritic", "lastUpdate"];
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

    // Send the result back
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
    mediaFiles: req.body.mediaFiles,
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
      mediaFiles: req.body.mediaFiles,
    },
    { new: true }
  );

  if (!song) return res.status(404).send("song not found");

  res.send(song);
});

router.patch("/:id", [auth, validateObjectId], async (req, res) => {
  try {
    // Validate the likesCount
    if (
      req.body.likesCount == null ||
      typeof req.body.likesCount !== "number"
    ) {
      return res.status(400).send("Invalid likesCount");
    }

    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { likesCount: req.body.likesCount },
      { new: true }
    );

    if (!song) return res.status(404).send("Song not found");

    // Perform post-update actions
    await song.updateMetacritic();
    await song.save();

    res.send(song);
  } catch (err) {
    console.error("Error updating song:", err);
    res.status(500).send("Something went wrong");
  }
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const song = await Song.findByIdAndDelete(req.params.id);
  if (!song) return res.status(404).send("song not found");

  res.send(song);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const song = await Song.findById(req.params.id).populate("mediaFiles");
  // .populate("audioFile");
  if (!song) return res.status(404).send("song not found");
  res.send(song);
});

module.exports = router;
