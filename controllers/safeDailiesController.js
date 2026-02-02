const db = require("../models/index");
const { Op } = require("sequelize");
const SafeDailies = db.models.SafeDailies;
const Daily = db.models.Daily;
const Safe = db.models.Safe;
const Admin = db.models.Admin;

module.exports = {
  add: async (req, res) => {
    try {
      const { date, total_cash, total_bank, total_dept, admin_id } = req.body;

      //check admin
      let admin = await Admin.findByPk(admin_id);
      if (!admin && admin_id) {
        return res.status(400).json({ error: "Invalid admin_id" });
      }

      const entry = await SafeDailies.create({
        date,
        total_cash,
        total_bank,
        total_dept,
        AdminAdminId: admin_id || null,
      });
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
  getByDate: async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate and endDate are required" });
      }
      const entries = await SafeDailies.findAll({
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
  deleteSafeDaily: async (req, res) => {
    try {
      const { id } = req.body;
      // Find the SafeDaily entry first

      const safeDaily = await SafeDailies.findOne({ where: { DailyId: id } });

      if (!safeDaily) {
        return res.status(404).json({ error: "SafeDaily not found" });
      }
      // Get the associated Safe
      const safe = await Safe.findByPk(safeDaily.SafeId);
      if (!safe) {
        return res.status(404).json({ error: "Associated Safe not found" });
      }
      // Deduct the totals from the Safe
      await safe.update({
        cash_amount: safe.cash_amount - safeDaily.total_cash,
        bank_amount: safe.bank_amount - safeDaily.total_bank,
        dept_amount: safe.dept_amount - safeDaily.total_dept,
      });

      // Set isAddedtoSafe=false for the related Daily
      if (safeDaily.DailyId) {
        const daily = await Daily.findByPk(safeDaily.DailyId);
        if (daily) {
          await daily.update({ isAddedtoSafe: false, isCreated: false });
        }
      }
      // Delete the SafeDaily entry
      await safeDaily.destroy();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
