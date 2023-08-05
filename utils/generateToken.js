const jwt = require("jsonwebtoken");

exports.generateAccessToken = (user) =>
  jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
    algorithm: "HS256",
  });

exports.generateRefreshToken = (user) =>
  jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
    algorithm: "HS256",
  });

exports.setRefreshTokenCookie = (res, token) => {
  res.cookie("refreshToken", token, {
    httpOnly: true, //accessible only by web server
    // origin: process.env.BASE_URL,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
