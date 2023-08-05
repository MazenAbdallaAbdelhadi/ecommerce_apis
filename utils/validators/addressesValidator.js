const joi = require("joi");
const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const ApiError = require("../ApiError");

const baseAddressSchema = {
  alias: joi.string(),
  details: joi.string(),
  phone: joi.string(),
  city: joi.string(),
  postalCode: joi.string(),
};

const errorMsg = (error) => error.details.map((err) => err.message);
const validate = (schema, data) =>
  schema.validate(data, {
    abortEarly: false,
    errors: { label: "key", wrap: { label: false } },
  });

exports.addAddressValidator = asyncHandler(async (req, res, next) => {
  const schema = joi
    .object(baseAddressSchema)
    .fork(Object.keys(baseAddressSchema), (key) => key.required());

  const { error } = validate(schema, req.body);
  if (error) {
    next(new ApiError(errorMsg(error), 400));
  }

  next();
});

exports.removeAddressValidator = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    next(new ApiError("unvalid id", 400));
  next();
});
