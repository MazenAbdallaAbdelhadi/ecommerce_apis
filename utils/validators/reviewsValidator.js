const joi = require("joi");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const ApiError = require("../ApiError");

const baseReviewSchema = {
  user: joi.custom((val) => mongoose.Types.ObjectId.isValid(val)),
  product: joi.custom((val) => mongoose.Types.ObjectId.isValid(val)),
  text: joi.string().trim(),
  rating: joi.number().min(0).max(5),
};

const errorMsg = (error) => error.details.map((err) => err.message);
const validate = (schema, data) =>
  schema.validate(data, {
    abortEarly: false,
    errors: { label: "key", wrap: { label: false } },
  });

exports.createReviewValidator = asyncHandler(async (req, res, next) => {
  const schema = joi
    .object(baseReviewSchema)
    .fork(Object.keys(baseReviewSchema), (key) => key.required());

  const { error } = validate(schema, req.body);
  if (error) {
    next(new ApiError(errorMsg(error), 400));
  }
  next();
});

exports.getReviewValidator = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    next(new ApiError("invalid id", 400));
  next();
});

exports.updateReviewValidator = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    next(new ApiError("invalid id", 400));

  const schema = joi.object(baseReviewSchema);

  const { error } = validate(schema, req.body);
  if (error) {
    next(new ApiError(errorMsg(error), 400));
  }

  next();
});

exports.deleteReviewValidator = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    next(new ApiError("unvalid id", 400));
  next();
});
