const mongoose = require("mongoose");

const dbConnect = async () => {
  mongoose.set("strictQuery", false);
  try {
    await mongoose.connect(process.env.DB_URI);
  } catch (err) {
    console.log(err);
    console.log("database error");
    process.exit(1);
  }
};
module.exports = dbConnect;
