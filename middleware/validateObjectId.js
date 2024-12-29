const mongoose = require("mongoose");

module.exports = function (req, res, next) {
  // console.log("validateObjectId middleware executed");
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send("Invalid ID.");

  next();
};
