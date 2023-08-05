const categoriesRoute = require("./categoriesRoute");
const productsRoute = require("./productsRoute");
const couponsRoute = require("./couponsRoute");
const usersRoute = require("./usersRoute");
const addressesRoute = require("./addressesRoute");
const wishlistRoute = require("./wishlistRoute");
const reviewsRoute = require("./reviewsRoute");
const cartsRoute = require("./cartRoute");
const ordersRoute = require("./orderRoute");

const mountRoutes = (app) => {
  app.use("/api/v1/categories", categoriesRoute);
  app.use("/api/v1/products", productsRoute);
  app.use("/api/v1/coupons", couponsRoute);
  app.use("/api/v1/users", usersRoute);
  app.use("/api/v1/addresses", addressesRoute);
  app.use("/api/v1/wishlist", wishlistRoute);
  app.use("/api/v1/reviews", reviewsRoute);
  app.use("/api/v1/carts", cartsRoute);
  app.use("/api/v1/orders", ordersRoute);
};

module.exports = mountRoutes;
