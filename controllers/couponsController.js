const factory = require("./handlersFactory");
const Coupons = require("../models/couponsModel");

/**
 * @desc    create new coupon
 * @route   api/v1/coupon
 * @method  POST
 * @access  private/admin
 */
exports.createCoupon = factory.createOne(Coupons);

/**
 * @desc    get specific coupon
 * @route   api/v1/coupons/:id
 * @method  GET
 * @access   private/admin
 */
exports.getCoupon = factory.getOne(Coupons);

/**
 * @desc    get All coupons
 * @route   api/v1/coupon
 * @method  GET
 * @access   private/admin
 */
exports.getAllCoupons = factory.getAll(Coupons);

/**
 * @desc    update coupon
 * @route   api/v1/coupons/:id
 * @method  PUT
 * @access  private/admin
 */
exports.updateCoupon = factory.updateOne(Coupons);

/**
 * @desc    delete coupon
 * @route   api/v1/coupons/:id
 * @method  DELETE
 * @access  private/admin
 */
exports.deleteCoupon = factory.deleteOne(Coupons);
