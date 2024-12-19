const auth = require("../middleware/auth");
const { Customer, validate } = require("../modules/customer");
const mongoose = require("mongoose");
const express = require("express");
const admin = require("../middleware/admin");
const router = express.Router();

router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("name");
  res.send(customers);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  try {
    const customer = new Customer({
      user: req.body.user,
      phone: req.body.phone,
      country: req.body.country,
      birth_date: req.body.birth_date,
    });
    await customer.save();
    res.send(customer);
  } catch (ex) {
    console.error("Error creating customer:", ex.message);
    res.status(500).send("An error occurred while creating the customer.");
  }
});

router.put("/:id", [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      isGold: req.body.isGold,
      name: req.body.name,
      phone: req.body.phone,
    },
    { new: true }
  );

  if (!customer) return res.status(404).send("customer not found");

  res.send(customer);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) return res.status(404).send("customer not found");

  res.send(customer);
});

router.get("/:id", async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).send("customer not found");
  res.send(customer);
});

module.exports = router;
