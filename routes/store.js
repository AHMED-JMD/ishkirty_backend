const express = require("express");
const router = express.Router();
const {
  addnew,
  getall,
  searched,
  update,
  deleteStore,
  addStoreSpices,
  getStoreSpice,
  deleteStoreSpice,
  createPurchase,
  getPurchases,
  deletePurchase,
} = require("../controllers/storeController");

router.get("/", getall);
router.post("/", addnew);
router.post("/update", update);
router.post("/search", searched);
router.post("/delete", deleteStore);
router.post("/addStoreSpices", addStoreSpices);
router.post("/store-items", getStoreSpice);
router.post("/deleteStoreSpice", deleteStoreSpice);

router.post("/purchase", createPurchase);
router.get("/purchase", getPurchases);
router.post("/purchase/delete", deletePurchase);

module.exports = router;
