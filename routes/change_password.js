const bcrypt = require("bcrypt");
const Joi = require("joi");
const { User } = require("../modules/user");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();

router.post("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.message);

  let user = await User.findOne({ _id: req.params.id });
  if (!user) return res.status(400).send("User not found.");

  const validPassword = await bcrypt.compare(
    req.body.old_password,
    user.password
  );
  if (!validPassword) return res.status(400).send("Invalid password.");

  const salt = await bcrypt.genSalt(10);
  const new_password = await bcrypt.hash(req.body.password, salt);

  const response = await User.updateOne(user, { password: new_password });

  res.send(user);
});

function validate(req) {
  const schema = Joi.object({
    old_password: Joi.string().required(),
    password: Joi.string().required(),
  });

  return schema.validate(req);
}

module.exports = router;