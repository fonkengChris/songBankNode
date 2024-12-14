const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Notation, validate } = require("../modules/notation");
const mongoose = require("mongoose");
const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

router.get("/", async (req, res) => {
  const notations = await Notation.find().sort("name");
  res.send(notations);
});

router.post("/", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let notation = new Notation({ name: req.body.name });
  notation = await notation.save();
  res.send(notation);
});

router.put("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);
  const notation = await Notation.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  if (!notation) return res.status(404).send("notation not found");

  res.send(notation);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const notation = await Notation.findByIdAndDelete(req.params.id);
  if (!notation) return res.status(404).send("notation not found");

  res.send(notation);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const notation = await Notation.findById(req.params.id);
  if (!notation) return res.status(404).send("notation not found");
  res.send(notation);
});

module.exports = router;
