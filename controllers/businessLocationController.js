const db = require("../models/index");
const { Op } = require("sequelize");

const BusinessLocation = db.models.BusinessLocation;
const Daily = db.models.Daily;
const Bill = db.models.Bill;
const EmpTrans = db.models.EmpTrans;
const PurchaseRequest = db.models.PurchaseRequest;
const Discharges = db.models.Discharges;

module.exports = {
  add: async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json("name is required");

      const existing = await BusinessLocation.findByPk(name);
      if (existing) return res.status(400).json("location already exists");

      const created = await BusinessLocation.create({ name, description });
      res.json(created);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const locations = await BusinessLocation.findAll({
        order: [["name", "ASC"]],
      });
      res.json(locations);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  delete: async (req, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json("name is required");

      const deleted = await BusinessLocation.destroy({ where: { name } });
      if (!deleted) return res.status(404).json("location not found");

      res.json("location deleted");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getLocationDaily: async (req, res) => {
    try {
      const { business_location, startDate, endDate } = req.body;
      if (!business_location)
        return res.status(400).json("business_location is required");

      const where = { business_location };
      if (startDate && endDate) {
        where.date = { [Op.between]: [startDate, endDate] };
      } else if (startDate) {
        where.date = startDate;
      }

      const dailies = await Daily.findAll({
        where,
        include: [
          { model: Bill, where: { business_location }, required: false },
          { model: EmpTrans, where: { business_location }, required: false },
          {
            model: PurchaseRequest,
            where: { business_location },
            required: false,
          },
          { model: Discharges, where: { business_location }, required: false },
        ],
        order: [["date", "DESC"]],
      });

      res.json(dailies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
