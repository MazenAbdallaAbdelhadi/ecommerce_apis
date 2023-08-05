const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const factory = require("./handlersFactory");
const Users = require("../models/usersModel");
const ApiError = require("../utils/ApiError");
const { uploadSingleImage } = require("../middleware/uploadImage");
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
} = require("../utils/generateToken");

// Upload single image
exports.uploadUserImage = uploadSingleImage("profileImg");

/**
 * @desc    create new user
 * @route   api/v1/users
 * @method  POST
 * @access  private/admin
 */
exports.createUser = factory.createOne(Users);

/**
 * @desc    get specific user
 * @route   api/v1/users/:id
 * @method  GET
 * @access  private/admin
 */
exports.getUser = factory.getOne(Users);

/**
 * @desc    get All users
 * @route   api/v1/users
 * @method  GET
 * @access  private/admin
 */
exports.getAllUsers = factory.getAll(Users);

/**
 * @desc    update user profile
 * @route   api/v1/users/:id
 * @method  PUT
 * @access  private/admin
 */
exports.updateUser = factory.updateOne(Users);

/**
 * @desc    update user password
 * @route   api/v1/users/changePassword/:id
 * @method  PUT
 * @access  private/admin
 */
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const user = await Users.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 10),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  if (!user) {
    next(new ApiError("user not found", 400));
  }
  res.status(200).json({ message: "password changed" });
});

/**
 * @desc    delete user
 * @route   api/v1/users/:id
 * @method  DELETE
 * @access  private/admin
 */
exports.deleteUser = factory.deleteOne(Users);

/**
 * @desc    user get his account
 * @route   api/v1/getMe
 * @method  GET
 * @access  protected/user
 */
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

/**
 * @desc    user update his account profile
 * @route   api/v1/updateMe
 * @method  PUT
 * @access  protected/user
 */
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

/**
 * @desc    user update his account password
 * @route   api/v1/updateMyPassword
 * @method  PUT
 * @access  protected/user
 */
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // 1) Update user password based user payload (req.user._id)
  const user = await Users.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 10),
      passwordChangedAt: Date.now(),
    },
    {
      new: true,
    }
  );

  // 2) Generate token
  const token = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({ data: user, token });
});

/**
 * @desc    user diactivate his account
 * @route   api/v1/deleteMe
 * @method  DELETE
 * @access  protected/user
 */
exports.deleteLoggedUserData = asyncHandler(async (req, res, next) => {
  await Users.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({ status: "Success" });
});
