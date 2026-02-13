const express = require("express");
const router = express.Router();
const validUser = require("../middlewares/auth");

const {
  add,
  getAll,
  delete: del,
  getLocationDaily,
} = require("../controllers/businessLocationController");

router.post("/", add);
router.get("/", getAll);
router.post("/delete", validUser, del);
router.post("/daily", getLocationDaily);

module.exports = router;
