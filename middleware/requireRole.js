const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/ApiError");

const requireRole = (...Roles) =>
  asyncHandler(async (req, res, next) => {
    const { user } = req;

    if (!Roles.includes(user.role)) {
      next(new ApiError("you are not allowed to make this request", 403));
    }
    next();
  });

module.exports = requireRole;
