const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Song, validatePost, validatePut } = require("../modules/song");
const mongoose = require("mongoose");
const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();
const { Language } = require("../modules/language");
const { Category } = require("../modules/category");
const { SongMediaFile } = require("../modules/song_media_file");

router.get("/", async (req, res) => {
  try {
    const {
      category,
      language,
      notation,
      sortOrder,
      searchText,
      page = 1,
      limit = 8,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    let pipeline = [];

    // Build initial match stage
    let initialMatch = {};
    if (category) initialMatch.category = new mongoose.Types.ObjectId(category);
    if (language) initialMatch.language = new mongoose.Types.ObjectId(language);
    if (searchText) initialMatch.$text = { $search: searchText };

    // Add initial match as first stage
    if (Object.keys(initialMatch).length) {
      pipeline.push({ $match: initialMatch });
    }

    // Add text score if searching
    if (searchText) {
      pipeline.push({
        $addFields: {
          score: { $meta: "textScore" },
        },
      });
    }

    // Lookup mediaFiles
    pipeline.push({
      $lookup: {
        from: "songmediafiles",
        localField: "mediaFiles",
        foreignField: "_id",
        as: "mediaFiles",
      },
    });

    // Only unwind and filter mediaFiles if notation is provided
    if (notation) {
      pipeline.push({
        $unwind: {
          path: "$mediaFiles",
          preserveNullAndEmptyArrays: true, // Changed to true
        },
      });

      pipeline.push({
        $match: {
          $or: [
            { "mediaFiles.notation": new mongoose.Types.ObjectId(notation) },
            { mediaFiles: null },
          ],
        },
      });
    }

    // Re-group only if we unwound
    if (notation) {
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
          mediaFiles: {
            $push: {
              $cond: [{ $eq: ["$mediaFiles", null] }, [], "$mediaFiles"],
            },
          },
          audioFile: { $first: "$audioFile" },
          languageOverride: { $first: "$languageOverride" },
        },
      });
    }

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

    // Handle sorting
    if (searchText) {
      pipeline.push({
        $sort: { score: { $meta: "textScore" } },
      });
    } else if (sortOrder) {
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

    // Add pagination
    pipeline.push({ $skip: (pageNum - 1) * limitNum }, { $limit: limitNum });

    // Execute the pipeline
    let songs = await Song.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = pipeline.slice(0, -2); // Remove skip and limit
    countPipeline.push({ $count: "total" });
    const [countResult] = await Song.aggregate(countPipeline);
    const total = countResult ? countResult.total : 0;

    res.send({
      songs,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        hasMore: pageNum * limitNum < total,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "Server error occurred", details: error.message });
  }
});

router.post("/", [auth, admin], async (req, res) => {
  try {
    const { error } = validatePost(req.body);
    if (error) return res.status(400).send(error.message);

    // Look up language and category by name
    const languageId = req.body.language._id;
    const language = await Language.findById(languageId);
    if (!language) return res.status(400).send("Invalid language name");

    // Extract category ID from request body
    const categoryId = req.body.category._id;
    const category = await Category.findById(categoryId);
    if (!category) return res.status(400).send("Invalid category ID");

    let song = new Song({
      title: req.body.title,
      slug: req.body.slug,
      authorName: req.body.authorName,
      description: req.body.description,
      lastUpdate: req.body.lastUpdate,
      lyrics: req.body.lyrics,
      language: languageId,
      category: categoryId,
      mediaFiles: req.body.mediaFiles,
    });

    song = await song.save();
    res.send(song);
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
});

router.put("/:id", [auth, admin, validateObjectId], async (req, res) => {
  try {
    const { error } = validatePut(req.body);
    if (error) return res.status(400).send(error.message);

    // First, create any new mediaFiles
    let mediaFileIds = [];
    if (req.body.mediaFiles && req.body.mediaFiles.length > 0) {
      const mediaFilePromises = req.body.mediaFiles.map(async (mediaFile) => {
        const newMediaFile = new SongMediaFile({
          song: req.params.id,
          name: mediaFile.name,
          documentFile: mediaFile.documentFile,
          audioFile: mediaFile.audioFile,
          previewImage: mediaFile.previewImage,
          notation: mediaFile.notation._id,
        });
        const savedMediaFile = await newMediaFile.save();
        return savedMediaFile._id;
      });

      mediaFileIds = await Promise.all(mediaFilePromises);
    }

    // Then update the song with the new mediaFile references
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
        mediaFiles: mediaFileIds, // Use the new mediaFile IDs
      },
      { new: true }
    );

    if (!song) return res.status(404).send("song not found");

    // Fetch the complete song with populated mediaFiles
    const populatedSong = await Song.findById(song._id).populate("mediaFiles");
    res.send(populatedSong);
  } catch (err) {
    console.error("Error updating song:", err);
    res.status(500).send("Something went wrong: " + err.message);
  }
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
