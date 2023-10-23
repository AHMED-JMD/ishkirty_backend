const db = require("../models/index");
const Spieces = db.models.Spieces;
const _ = require("lodash");

module.exports = {
  getAll: async (req, res) => {
    try {
      let spieces = await Spieces.findAll({});

      res.json(spieces);
    } catch (error) {
      if (error) throw error;
    }
  },
  add: async (req, res) => {
    try {
      const _feilds = _.pick(req.body, ["name", "category", "price"]);

      let filename = req.file;
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
      const _feilds = _.pick(req.body, [
        "id",
        "name",
        "category",
        "imgLink",
        "price",
      ]);

      if (_feilds.length < 4) return res.status(400).json("enter all feilds");

      //add new clients
      await Spieces.update(_feilds, { where: { id: _feilds.id } });

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  deleteSpieces: async (req, res) => {
    try {
      if (!req.body) return res.status(400).json("enter all feilds");

      req.body.map(async (id) => {
        await Spieces.destroy({ where: { id } });
      });

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
};
