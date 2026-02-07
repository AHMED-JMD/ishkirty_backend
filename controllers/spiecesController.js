const db = require("../models/index");
const Spieces = db.models.Spieces;
const Category = db.models.Category;
const _ = require("lodash");
const path = require("path");
const deleteFile = require("../middlewares/deleteImage");

module.exports = {
  getAll: async (req, res) => {
    try {
      let spieces = await Spieces.findAll({ order: [["price", "DESC"]] });

      res.json(spieces);
    } catch (error) {
      if (error) throw error;
    }
  },
  getByType: async (req, res) => {
    try {
      let { category } = req.body;

      if (!category) return res.status(400).json("enter all feilds");

      let spieces = await Spieces.findAll({
        where: { category },
        order: [["price", "DESC"]],
      });

      res.json(spieces);
    } catch (error) {
      if (error) throw error;
    }
  },
  getFavourites: async (req, res) => {
    try {
      let spieces = await Spieces.findAll({
        where: { isFavourites: true },
        order: [["price", "DESC"]],
      });

      res.json(spieces);
    } catch (error) {
      if (error) throw error;
    }
  },
  findOne: async (req, res) => {
    try {
      let { name } = req.body;
      //find the bill
      let spieces = await Spieces.findAll({
        where: { name },
      });
      //send the bill
      res.json(spieces);
    } catch (error) {
      throw error;
    }
  },
  add: async (req, res) => {
    try {
      const _feilds = _.pick(req.body, ["name", "categoryid", "price"]);

      let { filename } = req.file;
      //make sure image is sent
      if (!filename) return res.status(400).json("enter the image");
      //make sure feilds are completed
      if (Object.keys(_feilds).length < 2)
        return res.status(400).json("enter all feilds");

      //check if spieces exist
      // find category by id and set category values
      const category = await Category.findOne({
        where: { id: _feilds.categoryid },
      });
      if (!category) return res.status(400).json("category not found");

      let spieces = await Spieces.findOne({
        where: {
          name: _feilds.name,
          category: category.name,
          price: _feilds.price,
          categoryId: category.id,
        },
      });
      if (spieces) return res.status(400).json("spices exist");

      //add new spice with category name and categoryId
      await Spieces.create({
        name: _feilds.name,
        category: category.name,
        categoryId: category.id,
        ImgLink: filename,
        price: _feilds.price,
      });

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  update: async (req, res) => {
    try {
      const _feilds = _.pick(req.body, [
        "id",
        "name",
        "price",
        "categoryId",
        "isFavourites",
        "favBtn",
        "isControll",
        "cancel",
      ]);
      //make sure data is sent
      if (!_feilds) return res.status(400).json("enter all feilds");

      let spieces = await Spieces.findOne({
        where: { favBtn: _feilds.favBtn, isControll: _feilds.isControll },
      });
      if (spieces) return res.status(400).json("تم اختيار الزر في صنف مسبقا");

      //resolve category name by categoryId provided
      const category = await Category.findOne({
        where: { id: _feilds.categoryId },
      });
      if (!category) return res.status(400).json("category not found");

      //update clients
      if (_feilds.cancel === true) {
        await Spieces.update(
          {
            name: _feilds.name,
            category: category.name,
            categoryId: _feilds.categoryId,
            price: _feilds.price,
            isFavourites: false,
            favBtn: "",
            isControll: false,
          },
          { where: { id: _feilds.id } },
        );
      } else {
        //check if it is normal update
        let favBtn = _feilds.favBtn;
        let isFav = _feilds.isFavourites;
        let isCtrl = _feilds.isControll;
        if (!_feilds.isFavourites && !_feilds.favBtn && !_feilds.isControll) {
          favBtn = "";
          isFav = false;
          isCtrl = false;
        }
        //favourites update
        await Spieces.update(
          {
            name: _feilds.name,
            category: category.name,
            categoryId: _feilds.categoryId,
            price: _feilds.price,
            isFavourites: isFav,
            favBtn: favBtn,
            isControll: isCtrl,
          },
          { where: { id: _feilds.id } },
        );
      }

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  deleteSpieces: async (req, res) => {
    try {
      let { id } = req.body;

      if (!id) return res.status(400).json("enter all feilds");

      //get spieces data and delete img
      let spieces = await Spieces.findOne({ where: { id } });
      //delete image
      deleteFile(path.join(__dirname, `../public/${spieces.ImgLink}`));

      //delete all data
      await Spieces.destroy({ where: { id } });

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  updateCategoryIds: async (req, res) => {
    try {
      const spieces = await Spieces.findAll();
      let updated = 0;
      for (const s of spieces) {
        if (!s.category) continue;
        const category = await Category.findOne({
          where: { name: s.category },
        });
        if (category && s.categoryId !== category.id) {
          await s.update({ categoryId: category.id });
          updated++;
        }
      }
      res.json({ success: true, updated });
    } catch (error) {
      if (error) throw error;
    }
  },
};
