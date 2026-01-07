const express = require("express");
const router = express.Router();
const {
  addnew,
  getall,
  searched,
  addStoreSpices,
} = require("../controllers/storeController");

router.get("/", getall);
router.post("/", addnew);
router.post("/search", searched);
router.post("/addStoreSpices", addStoreSpices);
module.exports = router;
