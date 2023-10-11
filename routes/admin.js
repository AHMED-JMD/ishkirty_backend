const express = require("express");
const router = express.Router();
const validUser = require("../middlewares/auth");
const admin = require("../controllers/adminController");

router.post("/register_new_admin", admin.signup);

router.post("/login", admin.login);

router.get("/get-user", validUser, admin.getbyid);

router.post("/delete-user", admin.delete_user);
//reset password here

module.exports = router;
