const { Router } = require("express");
const router = Router();
const validUser = require("../middlewares/auth");
const {
  add,
  update,
  getAll,
  getOne,
  findOne,
  modify,
  deleteClient,
} = require("../controllers/clientController");

router.post("/update", update);
router.post("/modify", modify);
router.post("/", add);
router.get("/", getAll);
router.post("/get_one", getOne);
router.post("/find_one", findOne);
router.post("/delete", deleteClient);

module.exports = router;
