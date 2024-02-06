const { Router } = require("express");
const router = Router();
const validUser = require("../middlewares/auth");

const {
  get,
  add,
  modify,
  deleteTransfer,
} = require("../controllers/transferController");

//routes here
router.post("/", add);
router.post("/get", get);

router.post("/update", modify);
router.post("/delete", deleteTransfer);

module.exports = router;
