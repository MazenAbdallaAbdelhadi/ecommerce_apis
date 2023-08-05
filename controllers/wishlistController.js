const asyncHandler = require("express-async-handler");
const Users = require("../models/usersModel");
const ApiFeatures = require("../utils/ApiFeatures");

/**
 * @desc    add product to withlist
 * @route   api/v1/withlist
 * @method  POST
 * @access  protected/user
 */
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  // $addToSet => add productId to wishlist array if productId not exist
  const user = await Users.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product added successfully to your wishlist.",
    data: user.wishlist,
  });
});

/**
 * @desc    get user withlist
 * @route   api/v1/withlist
 * @method  GET
 * @access  protected/user
 */
exports.getLoggedUserWishlist = asyncHandler(async (req, res, next) => {
  const documentsCounts = Users.countDocuments({
    _id: req.user._id,
    wishlist: { $exists: true },
  });

  const apiFeatures = new ApiFeatures(Users.find(), req.query)
    .paginate(documentsCounts)
    .filter()
    .search()
    .limitFields()
    .sort();

  const { mongooseQuery, paginationResult } = apiFeatures;
  const documents = await mongooseQuery;

  res
    .status(200)
    .json({ results: documents.length, paginationResult, data: documents });
});

/**
 * @desc    remove product to withlist
 * @route   api/v1/withlist/:productId
 * @method  DELETE
 * @access  protected/user
 */
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  // $pull => remove productId from wishlist array if productId exist
  const user = await Users.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Product removed successfully from your wishlist.",
    data: user.wishlist,
  });
});
