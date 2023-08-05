const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: String,
    profileImg: String,
    password: {
      type: String,
      required: true,
      trim: true,
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetSecret: String,
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    active: {
      type: Boolean,
      default: true,
    },
    wishlist: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Products",
      },
    ],
    addresses: {
      type: [
        {
          id: { type: mongoose.Schema.Types.ObjectId },
          alias: String,
          details: String,
          phone: String,
          city: String,
          postalCode: String,
        },
      ],
      validate: {
        validator: (addresses) => addresses.length <= 5,
        message: "The maximum count of addresses is 5.",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("orderHistory", {
  ref: "Orders",
  foreignField: "user",
  localField: "_id",
});

// Hash password before saving to database
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  next();
});

// compare password with hashed password
userSchema.methods.comparePassword = async (password) => {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (err) {
    throw new Error(err);
  }
};

const Users = mongoose.model("Users", userSchema);

module.exports = Users;
