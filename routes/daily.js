const express = require("express");
const router = express.Router();
const {
  add,
  getAll,
  getOne,
  getByDate,
  update,
  delete: del,
} = require("../controllers/dailyController");

router.post("/", add);
router.get("/", getAll);
router.get("/get-one", getOne);

router.post("/date", getByDate);
router.post("/update", update);
router.post("/delete", del);

module.exports = router;
