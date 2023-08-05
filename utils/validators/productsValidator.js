const joi = require("joi");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const ApiError = require("../ApiError");

const baseProductSchema = {
  name: joi.string().trim(),
  description: joi.string().trim().min(20),
  price: joi.number().min(0),
  discount: joi.number(),
  coverImage: joi.string().trim(),
  images: joi.array().items(joi.string()).max(5),
  quantity: joi.number().min(0),
  category: joi.custom((val) => mongoose.Types.ObjectId.isValid(val)),
};

const errorMsg = (error) => error.details.map((err) => err.message);
const validate = (schema, data) =>
  schema.validate(data, {
    abortEarly: false,
    errors: { label: "key", wrap: { label: false } },
  });

exports.createProductValidator = asyncHandler(async (req, res, next) => {
  // remove images and discount from keys as they are optional
  let keys = Object.keys(baseProductSchema);
  const imagesIndex = keys.indexOf("images");
  keys.splice(imagesIndex, 1);
  const discountIndex = keys.indexOf("discount");
  keys.splice(discountIndex, 1);

  const schema = joi
    .object(baseProductSchema)
    .fork(keys, (key) => key.required());

  const { error } = validate(schema, req.body);
  if (error) {
    next(new ApiError(errorMsg(error), 400));
  }

  next();
});

exports.getProductValidator = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    next(new ApiError("invalid id", 400));
  next();
});

exports.updateProductValidator = asyncHandler(async (req, res, next) => {
  // 1- validate category id
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    next(new ApiError("invalid id", 400));

  // 2- validate category data
  const schema = joi.object(baseProductSchema);

  const { error } = validate(schema, req.body);
  if (error) {
    next(new ApiError(errorMsg(error), 400));
  }

  next();
});

exports.deleteProductValidator = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    next(new ApiError("unvalid id", 400));
  next();
});
