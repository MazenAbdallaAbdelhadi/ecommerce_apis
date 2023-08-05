const asyncHandler = require("express-async-handler");
const Users = require("../models/usersModel");

/**
 * @desc    Add new address to user addresses list
 * @route   api/v1/addresses
 * @method  POST
 * @access  protected/user
 */
exports.addAddress = asyncHandler(async (req, res, next) => {
  // $addToSet => add address object to user addresses  array if address not exist
  const user = await Users.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: { addresses: req.body },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address added successfully.",
    data: user.addresses,
  });
});

/**
 * @desc    Get logged user addresses list
 * @route   api/v1/addresses
 * @method  GET
 * @access  protected/user
 */
exports.getLoggedUserAddresses = asyncHandler(async (req, res, next) => {
  const user = await Users.findById(req.user._id).populate("addresses");

  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});

/**
 * @desc    Remove address from user addresses list
 * @route   api/v1/addresses/:id
 * @method  DELETE
 * @access  protected/user
 */
exports.removeAddress = asyncHandler(async (req, res, next) => {
  // $pull => remove address object from user addresses array if addressId exist
  const user = await Users.findByIdAndUpdate(
    req.user._id,
    {
      $pull: { addresses: { _id: req.params.addressId } },
    },
    { new: true }
  );

  res.status(200).json({
    status: "success",
    message: "Address removed successfully.",
    data: user.addresses,
  });
});
