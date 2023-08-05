const asyncHandler = require("express-async-handler");

const Product = require("../models/productsModel");
const Coupon = require("../models/couponsModel");
const Carts = require("../models/cartsModel");

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });
  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

/**
 * @desc    Add product to  cart
 * @route   POST /api/v1/cart
 * @access  Private/User
 */
exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await Product.findById(productId);

  // 1) Get Cart for logged user
  let cart = await Carts.findOne({ user: req.user._id });

  if (!cart) {
    // create cart fot logged user with product
    cart = await Carts.create({
      user: req.user._id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    // product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );

    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;

      cart.cartItems[productIndex] = cartItem;
    } else {
      // product not exist in cart,  push product to cartItems array
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }

  // Calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: "success",
    message: "Product added to cart successfully",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

/**
 * @desc    Get logged user cart
 * @route   GET /api/v1/cart
 * @access  Private/User
 */
exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Carts.findOne({ user: req.user._id });

  if (!cart) {
    return res
      .status(404)
      .json({ error: `There is no cart for this user id : ${req.user._id}` });
  }

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

/**
 * @desc    Remove specific cart item
 * @route   DELETE /api/v1/cart/:itemId
 * @access  Private/User
 */
exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Carts.findOneAndUpdate(
    { user: req.user._id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    { new: true }
  );

  calcTotalCartPrice(cart);
  cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

/**
 * @desc    clear logged user cart
 * @route   DELETE /api/v1/cart
 * @access  Private/User
 */
exports.clearCart = asyncHandler(async (req, res, next) => {
  await Carts.findOneAndDelete({ user: req.user._id });
  res.status(204).send();
});

/**
 * @desc    Update specific cart item quantity
 * @route   PUT /api/v1/cart/:itemId
 * @access  Private/User
 */
exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Carts.findOne({ user: req.user._id });
  if (!cart) {
    return res
      .status(404)
      .json({ error: `There is no cart for this user id : ${req.user._id}` });
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return res
      .status(404)
      .json({ error: `there is no item for this id :${req.params.itemId}` });
  }

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

/**
 * @desc    Apply coupon on logged user cart
 * @route   PUT /api/v1/cart/applyCoupon
 * @access  Private/User
 */
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    res.status(400).json({ error: `Coupon is invalid or expired` });
  }

  // 2) Get logged user cart to get total cart price
  const cart = await Carts.findOne({ user: req.user._id });

  const totalPrice = cart.totalCartPrice;

  // 3) Calculate price after priceAfterDiscount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2); // 99.23

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: "success",
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
