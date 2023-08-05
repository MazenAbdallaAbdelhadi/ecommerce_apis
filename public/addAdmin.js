require("dotenv").config();
const dbConnect = require("../config/database");
const User = require("../models/usersModel");

const createAdmin = async () => {
  dbConnect();
  const user = await User.create({
    name: "mazen",
    email: "mazen,mezoo20189@gmail.com",
    password: "pass1234",
    role: "admin",
  });
  console.log(`admin created with id ${user._id}`);
};

createAdmin();
