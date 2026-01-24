const db = require("../models/index");
const { Op } = require("sequelize");
const SafeTransfers = db.models.SafeTransfers;
const Safe = db.models.Safe;

module.exports = {
  add: async (req, res) => {
    try {
      const { date, from, to, amount, clientId } = req.body;
      const entry = await SafeTransfers.create({
        date,
        from,
        to,
        amount,
        clientId,
      });
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getByDate: async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate and endDate are required" });
      }
      const entries = await SafeTransfers.findAll({
        where: {
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [["date", "DESC"]],
      });
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const entries = await SafeTransfers.findAll({
        order: [["date", "DESC"]],
      });
      res.json(entries);
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

      //send response
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  deleteTransfer: async (req, res) => {
    try {
      const { id } = req.body;
      const entry = await SafeTransfers.findByPk(id);
      if (!entry) return res.status(404).json({ error: "Not found" });

      // Update Safe values
      const safe = await Safe.findByPk(entry.SafeId);
      if (safe) {
        // Reverse the transfer
        if (
          typeof safe[entry.from] === "number" &&
          typeof safe[entry.to] === "number"
        ) {
          safe[entry.from] += entry.amount;
          safe[entry.to] -= entry.amount;
          await safe.save();
        }
      }

      await SafeTransfers.destroy({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
