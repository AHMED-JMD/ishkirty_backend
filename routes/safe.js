const express = require("express");
const router = express.Router();
const {
  add,
  getAll,
  transfer,
  dailySafe,
} = require("../controllers/safeController");

// Add a new Safe
router.post("/add", add);

router.post("/dailySafe", dailySafe);

// View all Safes
router.get("/", getAll);

// Transfer between cash, bank, and dept
router.post("/transfer", transfer);

module.exports = router;
