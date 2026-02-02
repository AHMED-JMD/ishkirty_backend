const express = require("express");
const router = express.Router();
const {
  add,
  getAll,
  update,
  delete: del,
  addEmpTran,
  getEmpTran,
  getEmpTranByDate,
  deleteEmpTran,
  runNewMonth,
} = require("../controllers/employeeController");

router.get("/", getAll);
router.post("/", add);
router.post("/update", update);
router.post("/delete", del);

router.post("/emp_tran", addEmpTran);
router.post("/get_emp_trans", getEmpTran);
router.post("/get_emp_trans/date", getEmpTranByDate);
router.post("/delete_emp_tran", deleteEmpTran);

router.post("/new_month", runNewMonth);

module.exports = router;
