/**
 * @desc handle the addresses operations
 * @route api/v1/addresses
 */
const { Router } = require("express");
const {
  addAddressValidator,
  removeAddressValidator,
} = require("../utils/validators/addressesValidator");
const {
  addAddress,
  getLoggedUserAddresses,
  removeAddress,
} = require("../controllers/addressesController");
const requireAuth = require("../middleware/requireAuth");

const router = Router();

// this route require authentication and for admin only
router.use(requireAuth);

router
  .route("/")
  .post(addAddressValidator, addAddress)
  .get(getLoggedUserAddresses);
router.route("/:id").delete(removeAddressValidator, removeAddress);

module.exports = router;
