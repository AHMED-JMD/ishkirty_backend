const express = require("express");
const router = express.Router();
const {
  add,
  getAllLocDailies,
  getOne,
  getByDate,
  update,
  delete: del,
  unlockDaily,
  SyncDB,
} = require("../controllers/dailyController");

router.post("/", add);
router.post("/locs-dailies", getAllLocDailies);
router.post("/get-one", getOne);
router.post("/sync", SyncDB);

router.post("/date", getByDate);
router.post("/update", update);
router.post("/delete", del);
router.post("/unlock", unlockDaily);

module.exports = router;
