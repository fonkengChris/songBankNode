const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Category, validate } = require("../modules/category");
const mongoose = require("mongoose");
const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

router.get("/", async (req, res) => {
  const categories = await Category.find().sort("name");
  res.send(categories);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let category = new Category({ name: req.body.name });
  category = await category.save();
  res.send(category);
});

router.put("/:id", [auth, validateObjectId], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );

  if (!category) return res.status(404).send("category not found");

  res.send(category);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).send("category not found");

  res.send(category);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).send("category not found");
  res.send(category);
});

module.exports = router;
