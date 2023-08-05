/**
 * @desc handle the auth operations
 * @route api/v1/auth
 */
const { Router } = require("express");
const {
  login,
  register,
  refresh,
  logout,
  forgetPassword,
  verifyResetCode,
  resetPassword,
} = require("../controllers/authController");
const {
  loginValidator,
  registerValidator,
  refreshValidator,
  logoutValidator,
} = require("../utils/validators/authValidator");

const router = Router();

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.get("/refresh", refreshValidator, refresh);
router.delete("/logout", logoutValidator, logout);
router.post("/forgotPassword", forgetPassword);
router.post("/verifyResetCode", verifyResetCode);
router.post("/resetPassword", resetPassword);

module.exports = router;
