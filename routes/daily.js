const express = require("express");
const router = express.Router();
const { add, getAll, update, delete: del } = require("../controllers/dailyController");

router.post("/", add);
router.get("/", getAll);
router.post("/update", update);
router.post("/delete", del);

module.exports = router;
