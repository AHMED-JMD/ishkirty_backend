const express = require("express");
const router = express.Router();
const validUser = require("../middlewares/auth");
const admin = require("../controllers/adminController");

router.get("/", admin.getAll);
router.post("/register", admin.signup);
router.post("/login", admin.login);
router.get("/get-user", validUser, admin.getbyid);
router.post("/delete-user", admin.delete_user);
router.post("/update_password", admin.updatePassword);
//reset password here

module.exports = router;
