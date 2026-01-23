const db = require("../models/index");
const SafeDailies = db.models.SafeDailies;

module.exports = {
  add: async (req, res) => {
    try {
      const { date, total_cash, total_bank, total_dept } = req.body;
      const entry = await SafeDailies.create({ date, total_cash, total_bank, total_dept });
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const entries = await SafeDailies.findAll({ order: [["date", "DESC"]] });
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getOne: async (req, res) => {
    try {
      const { id } = req.body;
      const entry = await SafeDailies.findByPk(id);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const { id, date, total_cash, total_bank, total_dept } = req.body;
      const entry = await SafeDailies.findByPk(id);
      if (!entry) return res.status(404).json({ error: "Not found" });
      await entry.update({ date, total_cash, total_bank, total_dept });
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const { id } = req.body;
      await SafeDailies.destroy({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
