const db = require("../models/index");
const Spieces = db.models.Spieces;
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
      const _feilds = _.pick(req.body, ["name", "category", "price"]);

      let { filename } = req.file;
      //make sure image is sent
      if (!filename) return res.status(400).json("enter the image");
      //make sure feilds are completed
      if (_feilds.length < 2) return res.status(400).json("enter all feilds");

      //check if spieces exist
      let spieces = await Spieces.findOne({
        where: {
          name: _feilds.name,
          category: _feilds.category,
          price: _feilds.price,
        },
      });
      if (spieces) return res.status(400).json("client exist");

      //add new clients
      await Spieces.create({
        name: _feilds.name,
        category: _feilds.category,
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
      const _feilds = _.pick(req.body, ["id", "name", "category", "price"]);

      let { filename } = req.file;
      //make sure image is sent
      if (!filename) return res.status(400).json("enter the image");
      //make sure data is sent
      if (_feilds.length < 3) return res.status(400).json("enter all feilds");

      //find image pathe and delete it
      let spieces = await Spieces.findOne({ where: { id: _feilds.id } });
      //delete image
      deleteFile(path.join(__dirname, `../public/${spieces.ImgLink}`));

      //update clients
      await Spieces.update(
        {
          name: _feilds.name,
          category: _feilds.category,
          ImgLink: filename,
          price: _feilds.price,
        },
        { where: { id: _feilds.id } }
      );

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
};
