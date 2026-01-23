const express = require("express");
const router = express.Router();
const {
  add,
  getAll,
  getByDate,
  update,
  delete: del,
} = require("../controllers/dischargesController");

router.post("/", add);
router.get("/", getAll);
router.post("/date", getByDate);
router.post("/update", update);
router.post("/delete", del);

module.exports = router;
