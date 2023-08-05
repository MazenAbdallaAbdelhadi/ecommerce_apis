const joi = require("joi");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Users = require("../../models/usersModel");
const ApiError = require("../ApiError");

const baseUserSchema = {
  name: joi.string(),
  email: joi.string().email(),
  password: joi.string().min(8),
  confirmPassword: joi.string().valid(joi.ref("password")),
  phone: joi.string().regex(/^[0-9]{10}$/),
  profileImg: joi.string(),
  role: joi.string().valid("user", "admin"),
};

const errorMsg = (error) => error.details.map((err) => err.message);
const validate = (schema, data) =>
  schema.validate(data, {
    abortEarly: false,
    errors: { label: "key", wrap: { label: false } },
  });

exports.creatUserValidator = asyncHandler(async (req, res, next) => {
  const schema = joi
    .object(baseUserSchema)
    .fork(["name", "email", "password", "confirmPassword"], (key) =>
      key.required()
    );

  // Validate the request body
  const { error, value } = validate(schema, req.body);
  if (error) {
    next(new ApiError(errorMsg(error), 400));
  }

  // Check if the user already exists
  const userExists = await Users.findOne({ email: value.email });
  if (userExists) {
    next(new ApiError("user already exists", 400));
  }

  next();
});

exports.updateUserValidator = asyncHandler(async (req, res, next) => {
  // validate userId
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new ApiError("invalid Id", 400));
  }

  // Define update user validation schema
  const updateSchema = { ...baseUserSchema };
  delete updateSchema.password;
  delete updateSchema.confirmPassword;

  const schema = joi.object(updateSchema);
  // Validate the request body
  const { error, value } = validate(schema, req.body);
  if (error) {
    next(new ApiError(errorMsg(error), 400));
  }

  // Check if the user already exists
  if (req.body.email) {
    const userExists = await Users.findOne({ email: value.email });
    if (userExists) {
      next(new ApiError("user already exists", 400));
    }
  }

  next();
});

exports.getUserValidator = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new ApiError("invalid Id", 400));
  }
  next();
});

exports.deleteUserValidator = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new ApiError("invalid Id", 400));
  }
  next();
});

exports.updateUserPasswordValidator = asyncHandler(async (req, res, next) => {
  // validate userId
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    next(new ApiError("invalid Id", 400));
  }

  const updateSchema = {
    password: baseUserSchema.password,
    confirmPassword: baseUserSchema.confirmPassword,
  };

  const schema = joi
    .object(updateSchema)
    .fork(Object.keys(updateSchema), (key) => key.required());

  const { error } = validate(schema, req.body);
  if (error) {
    next(new ApiError(errorMsg(error), 400));
  }

  next();
});

exports.updateLoggedUserValidator = asyncHandler(async (req, res, next) => {
  // Define update user validation schema
  const updateSchema = { ...baseUserSchema };

  delete updateSchema.role;
  delete updateSchema.password;
  delete updateSchema.confirmPassword;

  const schema = joi.object(updateSchema);

  // Validate the request body
  const { error, value } = validate(schema, req.body);
  if (error) {
    next(new ApiError(errorMsg(error), 400));
  }

  // Check if the user already exists
  if (req.body.email) {
    const userExists = await Users.findOne({ email: value.email });
    if (userExists) {
      next(new ApiError("user already exists", 400));
    }
  }

  next();
});

exports.updateLoggedUserPasswordValidator = asyncHandler(
  async (req, res, next) => {
    const updateSchema = {
      password: baseUserSchema.password,
      confirmPassword: baseUserSchema.confirmPassword,
    };

    const schema = joi
      .object(updateSchema)
      .fork(Object.keys(updateSchema), (key) => key.required());

    const { error } = validate(schema, req.body);
    if (error) {
      next(new ApiError(errorMsg(error), 400));
    }

    next();
  }
);
