const { Router } = require("express");
const admin = require("./admin");
const spieces = require("./spieces");
const client = require("./client");
const bill = require("./bill");
const sales = require("./sales");
const transfer = require("./transfer");
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
router.use("/transfer", transfer);

module.exports = router;
