const db = require("../models/index");
const Category = db.models.Category;
const Spieces = db.models.Spieces;
const { requireBusinessLocation } = require("../middlewares/businessLocation");

module.exports = {
  getAll: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      let categories = await Category.findAll({
        where: { business_location },
        include: [
          { model: Spieces, where: { business_location }, required: false },
        ],
      });
      res.json(categories);
    } catch (error) {
      if (error) throw error;
    }
  },
  findOne: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      let { id } = req.params;
      if (!id) return res.status(400).json("enter all feilds");

      let category = await Category.findOne({
        where: { id, business_location },
        include: [
          { model: Spieces, where: { business_location }, required: false },
        ],
      });
      res.json(category);
    } catch (error) {
      if (error) throw error;
    }
  },
  add: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      let { name, description } = req.body;
      if (!name) return res.status(400).json("enter all feilds");

      let exists = await Category.findOne({
        where: { name, business_location },
      });
      if (exists) return res.status(400).json("category exists");

      await Category.create({ name, description, business_location });
      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  update: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      let { id, name, description } = req.body;
      if (!id || !name) return res.status(400).json("enter all feilds");

      await Category.update(
        { name, description },
        { where: { id, business_location } },
      );
      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  deleteCategory: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      let { id } = req.body;
      if (!id) return res.status(400).json("enter all feilds");

      // disassociate spieces first
      await Spieces.update(
        { categoryId: null },
        { where: { categoryId: id, business_location } },
      );
      await Category.destroy({ where: { id, business_location } });

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
};
