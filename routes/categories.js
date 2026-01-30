const { Router } = require("express");
const router = Router();
const {
  getAll,
  findOne,
  add,
  update,
  deleteCategory,
} = require("../controllers/categoryController");

router.post("/", add);
router.get("/", getAll);
router.get("/:id", findOne);
router.post("/update", update);
router.post("/delete", deleteCategory);

module.exports = router;
