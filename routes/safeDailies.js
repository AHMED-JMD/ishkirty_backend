const express = require("express");
const router = express.Router();
const {
  add,
  getAll,
  update,
  deleteSafeDaily,
  getByDate,
} = require("../controllers/safeDailiesController");

router.post("/add", add);
router.get("/all", getAll);
router.post("/update", update);
router.post("/delete", deleteSafeDaily);
router.post("/by-date", getByDate);

module.exports = router;
