const { Router } = require("express");
const {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getAllUsers,
  uploadUserImage,
  getLoggedUserData,
  updateLoggedUserPassword,
  deleteLoggedUserData,
  updateLoggedUserData,
  changeUserPassword,
} = require("../controllers/usersController");
const {
  creatUserValidator,
  deleteUserValidator,
  getUserValidator,
  updateUserValidator,
  updateLoggedUserValidator,
  updateUserPasswordValidator,
  updateLoggedUserPasswordValidator,
} = require("../utils/validators/userValidator");
const { resizeImage } = require("../controllers/handlersFactory");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");

const router = Router();
// this route require authentication
router.use(requireAuth);
router.get("/getMe", getLoggedUserData, getUser);
router.put(
  "/changeMyPassword",
  updateLoggedUserPasswordValidator,
  updateLoggedUserPassword
);
router.put(
  "/updateMe",
  uploadUserImage,
  resizeImage("user", 600, 600),
  updateLoggedUserValidator,
  updateLoggedUserData,
  updateUser
);
router.delete("/deleteMe", deleteLoggedUserData);

// admin routes
router.use(requireRole("admin"));
router
  .route("/")
  .get(getAllUsers)
  .post(
    uploadUserImage,
    resizeImage("user", 600, 600),
    creatUserValidator,
    createUser
  );

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(
    uploadUserImage,
    resizeImage("user", 600, 600),
    updateUserValidator,
    updateUser
  )
  .delete(deleteUserValidator, deleteUser);

router.put(
  "/changePassword/:id",
  updateUserPasswordValidator,
  changeUserPassword
);
module.exports = router;
