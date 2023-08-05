const path = require("path");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const dbConnect = require("./config/database");
const { logger, logEvent } = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const mountRoutes = require("./routes");
const ApiError = require("./utils/ApiError");
const { webhookCheckout } = require("./controllers/ordersController");

const app = express();

// connect to database
dbConnect();

//middleware
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger);

app.use(express.static(path.join(__dirname, "public")));

// Checkout webhook
app.post("/webhook-checkout", webhookCheckout);

//mount Routes
mountRoutes(app);

// handle notfound  routes
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// error handler
app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log(`conneted to database`);
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`app listening on http://localhost:${port}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvent(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
  process.exit(1);
});

module.exports = app;
