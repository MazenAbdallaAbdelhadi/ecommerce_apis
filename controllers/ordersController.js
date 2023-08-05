const stripe = require("stripe")(process.env.STRIPE_SECRET);
const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const ApiError = require("../utils/ApiError");

const Users = require("../models/usersModel");
const Orders = require("../models/ordersModel");
const Products = require("../models/productsModel");
const Carts = require("../models/cartsModel");

/**
 * @desc    create cash order
 * @route   api/v1/orders/cash
 * @method  POST
 * @access  public
 */
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Carts.findById(req.params.cartId);
  if (!cart) {
    return res
      .status(404)
      .json({ error: `There is no such cart with id ${req.params.cartId}` });
  }

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create order with default paymentMethodType cash
  const order = await Orders.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice,
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Products.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Carts.findByIdAndDelete(req.params.cartId);
  }

  res.status(201).json({ status: "success", data: order });
});

/**
 * @desc    get specific order
 * @route   api/v1/orders/:id
 * @method  GET
 * @access  private/admin
 */
exports.findSpecificOrder = factory.getOne(Orders);

/**
 * @desc    get All orders
 * @route   api/v1/orders
 * @method  GET
 * @access  private/admin
 */
exports.findAllOrders = factory.getAll(Orders);

/**
 * @desc    update order to paid
 * @route   api/v1/orders/:id/pay
 * @method  PUT
 * @access  private/admin
 */
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Orders.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});

/**
 * @desc    update order delivered status
 * @route   api/v1/orders/:id/deliveres
 * @method  PUT
 * @access  private/admin
 */
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Orders.findById(req.params.id);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${req.params.id}`,
        404
      )
    );
  }

  // update order to paid
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: "success", data: updatedOrder });
});

/**
 * @desc    Get checkout session from stripe and send it as response
 * @route   GET /api/v1/orders/checkout-session/cartId
 * @access  Protected/User
 */
exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app settings
  const taxPrice = 0;
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await Carts.findById(req.params.cartId);
  if (!cart) {
    next(ApiError(`There is no such cart with id ${req.params.cartId}`), 404);
  }

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        name: req.user.name,
        amount: totalOrderPrice * 100,
        currency: "egp",
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send session to response
  res.status(200).json({ status: "success", session });
});

const createCardOrder = async (session) => {
  const cartId = session.client_reference_id;
  const shippingAddress = session.metadata;
  const oderPrice = session.amount_total / 100;

  const cart = await Carts.findById(cartId);
  const user = await Users.findOne({ email: session.customer_email });

  // 3) Create order with default paymentMethodType card
  const order = await Orders.create({
    user: user._id,
    cartItems: cart.cartItems,
    shippingAddress,
    totalOrderPrice: oderPrice,
    isPaid: true,
    paidAt: Date.now(),
    paymentMethodType: "card",
  });

  // 4) After creating order, decrement product quantity, increment product sold
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));
    await Products.bulkWrite(bulkOption, {});

    // 5) Clear cart depend on cartId
    await Carts.findByIdAndDelete(cartId);
  }
};

/**
 * @desc    This webhook will run when stripe payment success paid
 * @route   POST /webhook-checkout
 * @access  Protected/User
 */
exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    next(ApiError(`Webhook Error: ${err.message}`, 400));
  }
  if (event.type === "checkout.session.completed") {
    //  Create order
    createCardOrder(event.data.object);
  }

  res.status(200).json({ received: true });
});
