const { Router } = require("express");
const router = Router();
const validUser = require("../middlewares/auth");
const {
  add,
  addbillTrans,
  getAll,
  getBillTrans,
  getOne,
  deleteBill,
} = require("../controllers/billController");

router.post("/bill_trans", addbillTrans);
router.post("/", add);
router.get("/", getAll);
router.get("/getTrans", getBillTrans);
router.post("/get_one", getOne);
router.post("/delete", deleteBill);

module.exports = router;
