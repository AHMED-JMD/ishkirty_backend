const db = require("../models/index");
const Daily = db.models.Daily;
const Bill = db.models.Bill;
const PurchaseRequest = db.models.PurchaseRequest;
const Discharges = db.models.Discharges;

module.exports = {
  add: async (req, res) => {
    try {
      const { date, today_sales, today_costs } = req.body;
      if (!date) return res.status(400).json("enter date");

      const daily = await Daily.create({
        date,
        today_sales: today_sales !== undefined ? Number(today_sales) : 0,
        today_costs: today_costs !== undefined ? Number(today_costs) : 0,
      });

      res.json({ success: true, daily });
    } catch (error) {
      throw error;
    }
  },

  getAll: async (req, res) => {
    try {
      const dailies = await Daily.findAll({ include: [Bill, PurchaseRequest, Discharges], order: [["date", "DESC"]] });
      res.json(dailies);
    } catch (error) {
      throw error;
    }
  },

  update: async (req, res) => {
    try {
      const { id, date, today_sales, today_costs } = req.body;
      if (!id) return res.status(400).json("enter id");

      const item = await Daily.findByPk(id);
      if (!item) return res.status(400).json("daily not found");

      await item.update({
        date: date !== undefined ? date : item.date,
        today_sales: today_sales !== undefined ? Number(today_sales) : item.today_sales,
        today_costs: today_costs !== undefined ? Number(today_costs) : item.today_costs,
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

      await Daily.destroy({ where: { id } });
      res.json("success");
    } catch (error) {
      throw error;
    }
  },
};
