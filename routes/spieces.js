const { Router } = require("express");
const router = Router();
const validUser = require("../middlewares/auth");
const uploadImage = require("../middlewares/multer");
const {
  getAll,
  getByType,
  findOne,
  add,
  update,
  deleteSpieces,
} = require("../controllers/spiecesController");

//routes here
router.post("/", uploadImage, add);
router.get("/", getAll);
router.post("/type", getByType);
router.post("/find_one", findOne);
router.post("/update", uploadImage, update);
router.post("/delete", deleteSpieces);

module.exports = router;
