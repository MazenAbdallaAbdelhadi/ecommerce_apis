const factory = require("./handlersFactory");
const Reviews = require("../models/reviewsModel");

/**
 * @desc    create new review
 * @route   api/v1/reviews
 * @method  POST
 * @access  public
 */
exports.createReview = factory.createOne(Reviews);

/**
 * @desc    get specific review
 * @route   api/v1/reviews/:id
 * @method  GET
 * @access  private/admin
 */
exports.getReview = factory.getOne(Reviews);

/**
 * @desc    get All reviews
 * @route   api/v1/reviews
 * @method  GET
 * @access  private/admin
 */
exports.getAllReviews = factory.getAll(Reviews);

/**
 * @desc    update review
 * @route   api/v1/reviews/:id
 * @method  PUT
 * @access  protected/user
 */
exports.updateReview = factory.updateOne(Reviews);

/**
 * @desc    delete review
 * @route   api/v1/reviews/:id
 * @method  DELETE
 * @access  protected/[user - admin]
 */
exports.deleteReview = factory.deleteOne(Reviews);
