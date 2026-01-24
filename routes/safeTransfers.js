const express = require("express");
const router = express.Router();
const {
  add,
  getAll,
  getByDate,
  update,
  deleteTransfer,
} = require("../controllers/safeTransfersController");

router.post("/add", add);
router.get("/all", getAll);
router.post("/update", update);
router.post("/by-date", getByDate);
router.post("/delete", deleteTransfer);

module.exports = router;
