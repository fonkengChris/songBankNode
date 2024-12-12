const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Language, validate } = require("../modules/language");
const mongoose = require("mongoose");
const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

router.get("/", async (req, res) => {
  const languages = await Language.find().sort("name");
  res.send(languages);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let language = new Language({ name: req.body.name });
  language = await language.save();
  res.send(language);
});

router.put("/:id", [auth, validateObjectId], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);
  const language = await Language.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  if (!language) return res.status(404).send("language not found");

  res.send(language);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const language = await Language.findByIdAndDelete(req.params.id);
  if (!language) return res.status(404).send("language not found");

  res.send(language);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const language = await Language.findById(req.params.id);
  if (!language) return res.status(404).send("language not found");
  res.send(language);
});

module.exports = router;
