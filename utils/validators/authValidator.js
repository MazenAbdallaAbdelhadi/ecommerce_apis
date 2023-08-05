const asyncHandler = require("express-async-handler");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const User = require("../../models/usersModel");
const ApiError = require("../ApiError");

const baseUserSchema = {
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
  confirmPassword: joi
    .string()
    .required("confirm password is required")
    .valid(joi.ref("password")),
  phone: joi
    .string()
    .optional()
    .regex(/^[0-9]{10}$/),
};

exports.loginValidator = asyncHandler(async (req, res, next) => {
  const userLoginSchema = joi.object({
    email: baseUserSchema.email,
    password: baseUserSchema.password,
  });

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

  // console.log(req.body.password);
  const result = await user.comparePassword(req.body.password);
  console.log(result);

  if (!user || !result) {
    // unAthorized
    next(new ApiError("Incorrect email or password", 401));
  }

  req.user = user;
  next();
});

exports.registerValidator = asyncHandler(async (req, res, next) => {
  // Validate the request body
  const { error, value } = joi.object(baseUserSchema).validate(req.body, {
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
