/**
 * @desc handle the categories operations
 * @route api/v1/categories
 */
const { Router } = require("express");
const {
  createCategoryValidator,
  getCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
} = require("../utils/validators/categoriesValidator");
const {
  createCategory,
  getAllCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoriesController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const router = Router();

router
  .route("/")
  .post(
    requireAuth,
    requireRole("admin"),
    createCategoryValidator,
    createCategory
  )
  .get(getAllCategories);
router
  .route("/:id")
  .get(getCategoryValidator, getCategory)
  .put(
    requireAuth,
    requireRole("admin"),
    updateCategoryValidator,
    updateCategory
  )
  .delete(
    requireAuth,
    requireRole("admin"),
    deleteCategoryValidator,
    deleteCategory
  );

module.exports = router;
