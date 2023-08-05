const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const ApiError = require("../ApiError");
const Products = require("../../models/productsModel");

exports.addProductToWishlistValidator = asyncHandler(async (req, res, next) => {
  const productId = req.body.productId;

  if (!mongoose.Types.ObjectId.isValid(productId))
    next(new ApiError("unvalid id", 400));

  const product = await Products.findById(productId);
  if (!product) next(new ApiError("unvalid id", 400));

  next();
});

exports.removeProductFromWishlistValidator = asyncHandler(
  async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.productId))
      next(new ApiError("unvalid id", 400));
    next();
  }
);
