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

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/refresh", refresh);
router.delete("/logout", logout);
router.post("/forgotPassword", forgetPassword);
router.post("verifyResetCode", verifyResetCode);
router.post("/resetPassword", resetPassword);

module.exports = router;
