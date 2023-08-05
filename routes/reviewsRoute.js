/**
 * @desc handle the reviews operations
 * @route api/v1/reviews
 */
const { Router } = require("express");
const {
  createReviewValidator,
  getReviewValidator,
  updateReviewValidator,
  deleteReviewValidator,
} = require("../utils/validators/reviewsValidator");
const {
  createReview,
  getReview,
  updateReview,
  getAllReviews,
  deleteReview,
} = require("../controllers/reviewsController");
const requireAuth = require("../middleware/requireAuth");

const router = Router();

// this route require authentication
router.use(requireAuth);
router.route("/").post(createReviewValidator, createReview).get(getAllReviews);

router
  .route("/:id")
  .get(getReviewValidator, getReview)
  .put(updateReviewValidator, updateReview)
  .delete(deleteReviewValidator, deleteReview);

module.exports = router;
