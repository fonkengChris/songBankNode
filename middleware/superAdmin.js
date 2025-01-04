const { ROLES } = require("../modules/user");

module.exports = function (req, res, next) {
  if (req.user.role !== ROLES.SUPER_ADMIN) {
    return res.status(403).send("Access denied.");
  }
  next();
};
