const { Router } = require("express");
const router = Router();
const validUser = require("../middlewares/auth");
const {
  add,
  getAll,
  getOne,
  todaysBill,
  getClientBills,
  deletedBillsUpdate,
  SearchInDates,
  getBillTrans,
  deleteBillTrans,
  deleteBill,
} = require("../controllers/billController");

router.post("/", add);
router.post("/by_type", getAll);
router.post("/today_bill", todaysBill);
router.post("/client_bills", getClientBills);
router.post("/deletd_update", deletedBillsUpdate);
router.post("/search_dates", SearchInDates);
router.post("/getTrans", getBillTrans);
router.post("/delTrans", deleteBillTrans);
router.post("/get_one", getOne);
router.post("/delete", deleteBill);

module.exports = router;
