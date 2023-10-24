const { Router } = require("express");
const router = Router();
const validUser = require("../middlewares/auth");
const uploadImage = require("../middlewares/multer");
const {
  getAll,
  add,
  update,
  deleteSpieces,
} = require("../controllers/spiecesController");

//routes here
router.post("/", uploadImage, add);

router.get("/", getAll);

router.post("/update", update);

router.post("/delete", deleteSpieces);

module.exports = router;
