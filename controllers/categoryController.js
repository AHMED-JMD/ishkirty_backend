const db = require("../models/index");
const Category = db.models.Category;
const Spieces = db.models.Spieces;

module.exports = {
  getAll: async (req, res) => {
    try {
      let categories = await Category.findAll({ include: [Spieces] });
      res.json(categories);
    } catch (error) {
      if (error) throw error;
    }
  },
  findOne: async (req, res) => {
    try {
      let { id } = req.params;
      if (!id) return res.status(400).json("enter all feilds");

      let category = await Category.findOne({ where: { id }, include: [Spieces] });
      res.json(category);
    } catch (error) {
      if (error) throw error;
    }
  },
  add: async (req, res) => {
    try {
      let { name, description } = req.body;
      if (!name) return res.status(400).json("enter all feilds");

      let exists = await Category.findOne({ where: { name } });
      if (exists) return res.status(400).json("category exists");

      await Category.create({ name, description });
      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  update: async (req, res) => {
    try {
      let { id, name, description } = req.body;
      if (!id || !name) return res.status(400).json("enter all feilds");

      await Category.update({ name, description }, { where: { id } });
      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  deleteCategory: async (req, res) => {
    try {
      let { id } = req.body;
      if (!id) return res.status(400).json("enter all feilds");

      // disassociate spieces first
      await Spieces.update({ categoryId: null }, { where: { categoryId: id } });
      await Category.destroy({ where: { id } });

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
};
