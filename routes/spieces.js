const { Router } = require("express");
const router = Router();
const validUser = require("../middlewares/auth");
const multer = require("multer");
const {
  getAll,
  add,
  update,
  deleteSpieces,
} = require("../controllers/spiecesController");

//multer middlware
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const uploadImage = multer({ storage: storage }).single("file");

//routes here
router.post("/", uploadImage, add);

router.get("/", getAll);

router.post("/update", update);

router.post("/delete", deleteSpieces);

module.exports = router;
