const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/usersModel");
const ApiError = require("../utils/ApiError");

const verifyToken = (token) =>
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, {
    algorithms: ["HS256"],
  });

const verifyPasswordChange = (user, decoded, next) => {
  if (user.passwordChangedAt) {
    const passChangedTimestamp = parseInt(
      user.passwordChangedAt.getTime() / 1000,
      10
    );

    // Password changed after token created (Error)
    if (passChangedTimestamp > decoded.iat) {
      next(
        new ApiError(
          "User recently changed his password. please login again..",
          403
        )
      );
    }
  }
};

// @desc   make sure the user is logged in
const requireAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    next(new ApiError("unauthorized", 401));
  }

  try {
    const decoded = verifyToken(token);
    // check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      next(new ApiError("unauthorized", 401));
    }

    // check if user is active
    if (!user.active) {
      next(new ApiError("user is not active", 401));
    }
    // Check if user change his password after token created
    verifyPasswordChange(user, decoded, next);

    req.user = user;
    next();
  } catch (error) {
    next(new ApiError("unauthorized", 401));
  }
});

module.exports = requireAuth;
