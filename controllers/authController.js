const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const { v4: uuid } = require("uuid");

const Users = require("../models/usersModel");
const {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
} = require("../utils/generateToken");
const ApiError = require("../utils/ApiError");
const sendEmail = require("../utils/sendEmail");

/**
 * @desc    register new user
 * @route   api/v1/auth/register
 * @method  POST
 * @access  public
 */
exports.register = asyncHandler(async (req, res, next) => {
  // Create user
  const user = await Users.create(req.body);

  // Generate token
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  setRefreshTokenCookie(res, refreshToken);

  delete user._doc.password;
  res.status(201).json({ data: user, token: accessToken });
});

/**
 * @desc    send access token to authorized user
 * @route   api/v1/auth/login
 * @method  POST
 * @access  public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { user } = req;

  // if the was not active make him active again
  if (user.active === false) {
    user.active = true;
    await user.save();
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  setRefreshTokenCookie(res, refreshToken);

  // delete user password from response
  delete user._doc.password;

  res.status(200).json({
    data: user,
    token: accessToken,
  });
});

/**
 * @desc    send new access token to authorized user if refresh token is set
 * @route   api/v1/auth/refresh
 * @method  GET
 * @access  public
 */
exports.refresh = asyncHandler(async (req, res) => {
  const accessToken = generateAccessToken(req.user);

  res.json({ accessToken });
});

/**
 * @desc    delete refresh token from authorized user
 * @route   api/v1/auth/logout
 * @method  DELETE
 * @access  public
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    //origin: process.env.BASE_URL,
    secure: false,
  });

  res.status(200).json({ success: true });
});

function generateResetCode() {
  const min = 100000; // Minimum 6-digit number (inclusive)
  const max = 999999; // Maximum 6-digit number (inclusive)
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}
/**
 * @desc    send code to user email to reset password
 * @route   api/v1/auth/forgotPassword
 * @method  POST
 * @access  public
 */
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  const user = await Users.findOne({ email: req.body.email });

  if (!user) {
    next(new ApiError("user not found", 404));
  }

  // generate Reset Code
  const resetCode = generateResetCode();
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");

  // Save hashed password reset code into db
  user.passwordResetCode = hashedResetCode;
  // Add expiration time for password reset code (10 min)
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  await user.save();

  // send email
  const message = `Dear ${user.name},\n\nWe recently received a request to reset your password for your shoppy account. To proceed with the password reset, please use the following reset code:\n\nReset Code: ${resetCode}\n\nPlease note that this code is valid for 10 minutes only. If you did not initiate this request or believe it to be an error, you can safely ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request (valid for 10 min)",
      message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    await user.save();
    next(new ApiError("There is an error in sending email", 500));
  }

  res
    .status(200)
    .json({ status: "Success", message: "Reset code sent to email" });
});

/**
 * @desc    verify password reset code and set token in header
 * @route   api/v1/auth/verifyResetCode
 * @method  POST
 * @access  public
 */
exports.verifyResetCode = asyncHandler(async (req, res, next) => {
  // hash reset code in the body
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  // find the user with the hashed reset code
  const user = await Users.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    next(new ApiError("invalid Reset code or expired", 400));
  }

  const resetSecret = uuid();

  res.cookie("resetSecret", resetSecret, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
  });

  user.passwordResetSecret = crypto
    .createHash("sha256")
    .update(resetSecret)
    .digest("hex");

  await user.save();

  res.status(200).json({
    status: "Success",
  });
});

/**
 * @desc    Reset password
 * @route   api/v1/auth/resetPassword
 * @method  POST
 * @access  public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { resetSecret } = req.cookies;

  if (!resetSecret) {
    next(new ApiError("Reset code not verified", 400));
  }

  const user = await Users.findOne({ email: req.body.email });

  if (!user) {
    next(new ApiError("user not found", 400));
  }

  const resetSecretHash = crypto
    .createHash("sha256")
    .update(resetSecret)
    .digest("hex");

  if (resetSecretHash !== user.passwordResetSecret) {
    next(new ApiError("invalid request", 401));
  }

  user.password = req.body.newPassword;
  user.passwordChangedAt = Date.now();
  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetSecret = undefined;

  await user.save();

  res
    .status(200)
    .json({ status: "Success", message: "Password changed please login" });
});
