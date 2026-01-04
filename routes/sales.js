const { Router } = require("express");
const router = Router();
const {
  todaysSales,
  spiecesSales,
  allSpicesSales,
  searchedSales,
} = require("../controllers/salesController");

router.post("/today_sales", todaysSales);
router.post("/spieces_sales", spiecesSales);
router.post("/all_spieces_sales", allSpicesSales);
router.post("/searched_sales", searchedSales);

module.exports = router;
