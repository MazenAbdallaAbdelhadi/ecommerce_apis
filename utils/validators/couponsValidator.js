const joi = require("joi");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const ApiError = require("../ApiError");

const baseCouponSchema = {
  code: joi.string().trim(),
  discountAmount: joi.number().min(0),
  expirationDate: joi.date(),
};

const errorMsg = (error) => error.details.map((err) => err.message);
const validate = (schema, data) =>
  schema.validate(data, {
    abortEarly: false,
    errors: { label: "key", wrap: { label: false } },
  });

exports.createCouponValidator = asyncHandler(async (req, res, next) => {
  const schema = joi
    .object(baseCouponSchema)
    .fork(Object.keys(baseCouponSchema), (key) => key.required());

  const { error } = validate(schema, req.body);
  if (error) {
    next(new ApiError(errorMsg(error), 400));
  }

  next();
});

exports.getCouponValidator = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    next(new ApiError("invalid id", 400));
  next();
});

exports.updateCouponValidator = asyncHandler(async (req, res, next) => {
  // 1- validate category id
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    next(new ApiError("invalid id", 400));

  // 2- validate category data
  const schema = joi.object(baseCouponSchema);

  const { error } = validate(schema, req.body);
  if (error) {
    next(new ApiError(errorMsg(error), 400));
  }

  next();
});

exports.deleteCouponValidator = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    next(new ApiError("unvalid id", 400));
  next();
});
