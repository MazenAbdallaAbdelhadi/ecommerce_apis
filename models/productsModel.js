const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 20,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    discount: Number,
    coverImage: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categories",
    },
    ratingsAverage: Number,
    ratingsQuantity: Number,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("reviews", {
  ref: "Reviews",
  localField: "_id",
  foreignField: "product",
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "category",
    select: "name",
  });
  next();
});

const Products = mongoose.model("Products", productSchema);

module.exports = Products;
