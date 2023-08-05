/**
 * @desc handle the coupons operations
 * @route api/v1/coupons
 */
const { Router } = require("express");
const {
  createCouponValidator,
  getCouponValidator,
  updateCouponValidator,
  deleteCouponValidator,
} = require("../utils/validators/couponsValidator");
const {
  createCoupon,
  getAllCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponsController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const router = Router();

// this route require authentication and for admin only
router.use(requireAuth);
router.use(requireRole("admin"));

router.route("/").post(createCouponValidator, createCoupon).get(getAllCoupons);
router
  .route("/:id")
  .get(getCouponValidator, getCoupon)
  .put(updateCouponValidator, updateCoupon)
  .delete(deleteCouponValidator, deleteCoupon);

module.exports = router;
