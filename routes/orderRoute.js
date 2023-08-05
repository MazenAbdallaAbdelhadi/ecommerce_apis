const express = require("express");
const {
  createCashOrder,
  findAllOrders,
  findSpecificOrder,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} = require("../controllers/ordersController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

router.use(requireAuth);

router.get("/checkout-session/:cartId", requireRole("user"), checkoutSession);

router.route("/:cartId").post(requireRole("user"), createCashOrder);
router.get("/", requireRole("admin"), findAllOrders);
router.get("/:id", findSpecificOrder);

router.put("/:id/pay", requireRole("admin"), updateOrderToPaid);
router.put("/:id/deliver", requireRole("admin"), updateOrderToDelivered);

module.exports = router;
