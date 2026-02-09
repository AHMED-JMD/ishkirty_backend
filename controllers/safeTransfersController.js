const db = require("../models/index");
const { Op } = require("sequelize");
const SafeTransfers = db.models.SafeTransfers;
const Safe = db.models.Safe;
const { requireBusinessLocation } = require("../middlewares/businessLocation");

module.exports = {
  add: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { date, from, to, amount, clientId, admin_id } = req.body;

      //check admin
      if (admin_id) {
        return res.status(400).json({ error: "no admin_id" });
      }
      let admin = await db.models.Admin.findByPk(admin_id);
      if (!admin) {
        return res.status(400).json({ error: "Invalid admin_id" });
      }

      const entry = await SafeTransfers.create({
        date,
        from,
        to,
        amount,
        clientId,
        admin: admin.username,
        AdminAdminId: admin_id,
        business_location,
      });
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getByDate: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

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
          business_location,
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
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const entries = await SafeTransfers.findAll({
        where: { business_location },
        order: [["date", "DESC"]],
      });
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  update: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { id, date, from, to, amount, clientId } = req.body;

      const entry = await SafeTransfers.findOne({
        where: { id, business_location },
      });
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
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { id } = req.body;
      const entry = await SafeTransfers.findOne({
        where: { id, business_location },
      });
      if (!entry) return res.status(404).json({ error: "Not found" });

      // Update Safe values
      const safe = await Safe.findOne({
        where: { id: entry.SafeId, business_location },
      });
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

      await SafeTransfers.destroy({ where: { id, business_location } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
