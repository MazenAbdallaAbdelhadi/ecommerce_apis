const factory = require("./handlersFactory");
const Categories = require("../models/categoriesModel");
const { uploadSingleImage } = require("../middleware/uploadImage");

// Upload single image
exports.uploadCategoryImage = uploadSingleImage("image");

/**
 * @desc    create new category
 * @route   api/v1/categories
 * @method  POST
 * @access  private/admin
 */
exports.createCategory = factory.createOne(Categories);

/**
 * @desc    get specific category
 * @route   api/v1/categories/:id
 * @method  GET
 * @access  public
 */
exports.getCategory = factory.getOne(Categories);

/**
 * @desc    get All categories
 * @route   api/v1/categories
 * @method  GET
 * @access  public
 */
exports.getAllCategories = factory.getAll(Categories);

/**
 * @desc    update category
 * @route   api/v1/categories/:id
 * @method  PUT
 * @access  private/admin
 */
exports.updateCategory = factory.updateOne(Categories);

/**
 * @desc    delete category
 * @route   api/v1/categories/:id
 * @method  DELETE
 * @access  private/admin
 */
exports.deleteCategory = factory.deleteOne(Categories);
