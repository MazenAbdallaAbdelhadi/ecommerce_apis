/**
 * @desc handle the whishlist operations
 * @route api/v1/wishlist
 */
const { Router } = require("express");
const {
  addProductToWishlistValidator,
  removeProductFromWishlistValidator,
} = require("../utils/validators/wishlistValidator");
const {
  addProductToWishlist,
  getLoggedUserWishlist,
  removeProductFromWishlist,
} = require("../controllers/wishlistController");
const requireAuth = require("../middleware/requireAuth");

const router = Router();

// this route require authentication
router.use(requireAuth);
router
  .route("/")
  .post(addProductToWishlistValidator, addProductToWishlist)
  .get(getLoggedUserWishlist);

router.delete(
  "/:productId",
  removeProductFromWishlistValidator,
  removeProductFromWishlist
);

module.exports = router;
