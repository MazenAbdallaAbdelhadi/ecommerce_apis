const joi = require("joi");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const ApiError = require("../ApiError");

const baseCategorySchema = {
  name: joi.string().trim(),
  description: joi.string().trim(),
  image: joi.string().trim(),
};

const errorMsg = (error) => error.details.map((err) => err.message);
const validate = (schema, data) =>
  schema.validate(data, {
    abortEarly: false,
    errors: { label: "key", wrap: { label: false } },
  });

exports.createCategoryValidator = asyncHandler(async (req, res, next) => {
  const schema = joi
    .object(baseCategorySchema)
    .fork(Object.keys(baseCategorySchema), (key) => key.required());

  const { error } = validate(schema, req.body);
  if (error) {
    next(new ApiError(errorMsg(error), 400));
  }

  next();
});

exports.getCategoryValidator = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    next(new ApiError("invalid id", 400));
  next();
});

exports.updateCategoryValidator = asyncHandler(async (req, res, next) => {
  // 1- validate category id
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    next(new ApiError("invalid id", 400));

  // 2- validate category data
  const schema = joi.object(baseCategorySchema);

  const { error } = validate(schema, req.body);
  if (error) {
    next(new ApiError(errorMsg(error), 400));
  }

  next();
});

exports.deleteCategoryValidator = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    next(new ApiError("unvalid id", 400));
  next();
});
