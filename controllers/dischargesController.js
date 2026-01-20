const db = require("../models/index");
const Discharges = db.models.Discharges;
const Daily = db.models.Daily;

module.exports = {
  add: async (req, res) => {
    try {
      const { name, price, date, dailyId } = req.body;
      if (!name || price === undefined || !date)
        return res.status(400).json("enter all feilds");

      const discharge = await Discharges.create({
        name,
        price: Number(price),
        date,
        DailyId: dailyId !== undefined ? dailyId : null,
      });

      res.json({ success: true, discharge });
    } catch (error) {
      throw error;
    }
  },

  getAll: async (req, res) => {
    try {
      const discharges = await Discharges.findAll({ include: [Daily], order: [["date", "DESC"]] });
      res.json(discharges);
    } catch (error) {
      throw error;
    }
  },

  update: async (req, res) => {
    try {
      const { id, name, price, date, dailyId } = req.body;
      if (!id) return res.status(400).json("enter id");

      const item = await Discharges.findByPk(id);
      if (!item) return res.status(400).json("discharge not found");

      await item.update({
        name: name !== undefined ? name : item.name,
        price: price !== undefined ? Number(price) : item.price,
        date: date !== undefined ? date : item.date,
        DailyId: dailyId !== undefined ? dailyId : item.DailyId,
      });

      res.json("success");
    } catch (error) {
      throw error;
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json("enter id");

      await Discharges.destroy({ where: { id } });
      res.json("success");
    } catch (error) {
      throw error;
    }
  },
};
