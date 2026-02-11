const express = require("express");
const router = express.Router();

const {
  add,
  getAll,
  delete: del,
  getLocationDaily,
} = require("../controllers/businessLocationController");

router.post("/", add);
router.get("/", getAll);
router.post("/delete", del);
router.post("/daily", getLocationDaily);

module.exports = router;
