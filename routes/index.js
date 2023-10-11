const { Router } = require("express");
const admin = require("./admin");

/**
 * @description register all of your routes here and they will be
 * automatically imported in the app.js and mapped correctly
 */

const router = Router();

router.use("/admin", admin);

module.exports = router;
