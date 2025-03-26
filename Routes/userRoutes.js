const express = require("express");
const {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  ResetPassword,
} = require("../Controllers/Logincontroller");
const router = express.Router();
router.post("/", registerUser);
router.post("/loginuser", loginUser);
router.get("/alluser", getAllUsers);
router.get("/:id", getUserById);
router.delete("/:id", deleteUser);
router.patch("/:id", updateUser);
router.patch("/resetPassword/:id",ResetPassword)
module.exports = router;
