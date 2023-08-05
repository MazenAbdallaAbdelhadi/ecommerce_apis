/**
 * @desc handle the products operations
 * @route api/v1/products
 */
const { Router } = require("express");
const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validators/productsValidator");
const {
  createProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  resizeProductImages,
} = require("../controllers/productsController");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const router = Router();

router
  .route("/")
  .post(
    requireAuth,
    requireRole("admin"),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct
  )
  .get(getAllProducts);
router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    requireAuth,
    requireRole("admin"),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct
  )
  .delete(
    requireAuth,
    requireRole("admin"),
    deleteProductValidator,
    deleteProduct
  );

module.exports = router;
