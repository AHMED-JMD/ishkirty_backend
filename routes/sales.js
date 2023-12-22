const { Router } = require("express");
const router = Router();
const { todaysBill } = require("../controllers/salesController");

router.post("/today_sales", todaysBill);

module.exports = router;
