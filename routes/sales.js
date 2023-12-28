const { Router } = require("express");
const router = Router();
const {
  todaysBill,
  spiecesSales,
  searchedSales,
} = require("../controllers/salesController");

router.post("/today_sales", todaysBill);
router.post("/spieces_sales", spiecesSales);
router.post("/searched_sales", searchedSales);

module.exports = router;
