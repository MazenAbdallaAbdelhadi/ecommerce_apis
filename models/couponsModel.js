const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Coupons = mongoose.model("Coupons", couponSchema);

module.exports = Coupons;
