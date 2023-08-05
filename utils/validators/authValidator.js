const asyncHandler = require("express-async-handler");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const User = require("../../models/usersModel");
const ApiError = require("../ApiError");

const baseUserSchema = {
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string()
    .required("confirm password is required")
    .valid(Joi.ref("password")),
  phone: Joi.string()
    .optional()
    .regex(/^[0-9]{10}$/),
};

exports.loginValidator = asyncHandler(async (req, res, next) => {
  const userLoginSchema = Joi.object(
    baseUserSchema.email,
    baseUserSchema.password
  );

  const { error } = userLoginSchema.validate(req.body, {
    errors: { label: "key", wrap: { label: false } },
  });

  if (error) {
    next(
      new ApiError(
        error.details.map((err) => err.message),
        400
      )
    );
  }

  const user = await User.findOne({ email: req.body.email });

  if (!user || !(await user.comparePassword(req.body.password))) {
    // unAthorized
    next(new ApiError("Incorrect email or password", 401));
  }

  req.user = user;
  next();
});

exports.registerValidator = asyncHandler(async (req, res, next) => {
  // Validate the request body
  const { error, value } = baseUserSchema.validate(req.body, {
    errors: { label: "key", wrap: { label: false } },
  });

  if (error) {
    next(
      new ApiError(
        error.details.map((err) => err.message),
        400
      )
    );
  }

  // Check if the user already exists
  const userExists = await User.findOne({ email: value.email });
  if (userExists) {
    next(new ApiError("email already exists", 400));
  }

  next();
});

exports.refreshValidator = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    next(new ApiError("Refresh token not found", 401));
  }

  const decodedToken = jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    { algorithms: ["HS256"] }
  );

  const user = await User.findById(decodedToken.userId);

  if (!user) {
    next(new ApiError("User not found", 401));
  }

  req.user = user;
  next();
});

exports.logoutValidator = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    next(new ApiError("No Content", 204));
  }

  next();
});
