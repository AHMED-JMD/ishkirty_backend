const { Router } = require("express");
const admin = require("./admin");
const spieces = require("./spieces");
const client = require("./client");
const bill = require("./bill");
const sales = require("./sales");
const transfer = require("./transfer");
const store = require("./store");
const employee = require("./employee");
const discharges = require("./discharges");
const daily = require("./daily");
const safe = require("./safe");

/**
 * @description register all of your routes here and they will be
 * automatically imported in the app.js and mapped correctly
 */

const router = Router();

router.use("/admin", admin);
router.use("/bill", bill);
router.use("/sales", sales);
router.use("/client", client);
router.use("/spieces", spieces);
router.use("/store", store);
router.use("/transfer", transfer);
router.use("/employee", employee);
router.use("/discharges", discharges);
router.use("/daily", daily);
router.use("/safe", safe);
router.use("/safe-dailies", require("./safeDailies"));
router.use("/safe-transfers", require("./safeTransfers"));

module.exports = router;
