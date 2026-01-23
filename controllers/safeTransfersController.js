const db = require("../models/index");
const SafeTransfers = db.models.SafeTransfers;

module.exports = {
  add: async (req, res) => {
    try {
      const { date, from, to, amount, clientId } = req.body;
      const entry = await SafeTransfers.create({ date, from, to, amount, clientId });
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const entries = await SafeTransfers.findAll({ order: [["date", "DESC"]] });
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getOne: async (req, res) => {
    try {
      const { id } = req.body;
      const entry = await SafeTransfers.findByPk(id);
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const { id, date, from, to, amount, clientId } = req.body;
      const entry = await SafeTransfers.findByPk(id);
      if (!entry) return res.status(404).json({ error: "Not found" });
      await entry.update({ date, from, to, amount, clientId });
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  delete: async (req, res) => {
    try {
      const { id } = req.body;
      await SafeTransfers.destroy({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
