const db = require("../models/index");
const Safe = db.models.Safe;
const Client = db.models.Client;
const Daily = db.models.Daily;
const SafeTransfers = db.models.SafeTransfers;
const SafeDailies = db.models.SafeDailies;
const Admin = db.models.Admin;

const _ = require("lodash");
const { requireBusinessLocation } = require("../middlewares/businessLocation");

module.exports = {
  add: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const fields = _.pick(req.body, [
        "bank_amount",
        "fawry_amount",
        "cash_amount",
        "dept_amount",
      ]);

      const safe = await Safe.create({ ...fields, business_location });

      res.json(safe);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getAll: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const safes = await Safe.findAll({ where: { business_location } });
      res.json(safes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  transfer: async (req, res) => {
    const business_location = requireBusinessLocation(req, res);
    if (!business_location) return;

    const { id, from, to, amount, clientId, admin_id } = req.body;
    if (
      !["cash_amount", "bank_amount", "fawry_amount", "dept_amount"].includes(
        from,
      ) ||
      !["cash_amount", "bank_amount", "fawry_amount", "dept_amount"].includes(
        to,
      ) ||
      !admin_id
    ) {
      return res.status(400).json({ error: "Invalid transfer fields" });
    }
    if (from === to) {
      return res
        .status(400)
        .json({ error: "Cannot transfer to the same field" });
    }
    try {
      //check admin
      let admin = await Admin.findByPk(admin_id);
      if (!admin) {
        return res.status(400).json({ error: "Invalid admin_id" });
      }

      const safe = await Safe.findOne({ where: { id, business_location } });
      if (!safe) return res.status(404).json({ error: "Safe not found" });

      if (safe[from] < amount)
        return res.status(400).json({ error: "Insufficient funds" });

      // Handle client account if clientId is provided
      let client = null;
      if (clientId) {
        client = await Client.findByPk(clientId);
        if (!client) return res.status(404).json({ error: "Client not found" });
      }

      // If from dept_amount, deduct from client account
      if (from === "dept_amount" && client) {
        if (client.account < amount) {
          return res.status(400).json({ error: "Insufficient client account" });
        }
        client.account -= amount;
        await client.save();
      }
      // If to dept_amount, add to client account
      if (to === "dept_amount" && client) {
        client.account += amount;
        await client.save();
      }

      safe[from] -= amount;
      safe[to] += amount;
      await safe.save();

      // Create SafeTransfers entry
      const now = new Date();
      await SafeTransfers.create({
        date: now.toISOString().slice(0, 10),
        from,
        to,
        amount,
        clientId: clientId || null,
        SafeId: safe.id,
        AdminAdminId: admin_id,
        business_location,
      });

      res.json(safe);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  dailySafe: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const {
        date,
        cash_sales,
        bank_sales,
        fawry_sales,
        account_sales,
        cash_costs,
        bank_costs,
        fawry_costs,
        account_costs,
        dailyId,
        admin_id,
      } = req.body;

      console.log(req.body);

      if (!date || !admin_id) return res.status(400).json("enter date");

      // Check if SafeDailies exists for this date
      const existing = await SafeDailies.findOne({
        where: { date, business_location },
      });
      if (existing) {
        return res.json({
          message: "Safe Daily already exists for this date. Safe not updated.",
        });
      }

      //check admin
      let admin = await Admin.findByPk(admin_id);
      if (!admin) {
        return res.status(400).json({ error: "Invalid admin_id" });
      }

      // Update Safe with id=1
      const safe = await Safe.findOne({ where: { business_location } });
      let total_cash = 0,
        total_bank = 0,
        total_fawry = 0,
        total_dept = 0;
      if (safe) {
        if (cash_sales !== undefined && cash_costs !== undefined) {
          total_cash = Number(cash_sales) - Number(cash_costs);
          safe.cash_amount += total_cash;
        }
        if (bank_sales !== undefined && bank_costs !== undefined) {
          total_bank = Number(bank_sales) - Number(bank_costs);
          safe.bank_amount += total_bank;
        }
        if (fawry_sales !== undefined && fawry_costs !== undefined) {
          total_fawry = Number(fawry_sales) - Number(fawry_costs);
          safe.fawry_amount += total_fawry;
        }
        if (account_sales !== undefined && account_costs !== undefined) {
          total_dept = Number(account_sales) - Number(account_costs);
          safe.dept_amount += total_dept;
        }
        await safe.save();
        // Create SafeDailies entry
        const safeDaily = await SafeDailies.create({
          date,
          total_cash,
          total_bank,
          total_fawry,
          total_dept,
          SafeId: safe.id,
          AdminAdminId: admin_id,
          DailyId: dailyId,
          business_location,
        });

        // Update Daily.isAddedtoSafe to true for this date
        await Daily.update(
          { isAddedtoSafe: true, safeId: safe.id },
          { where: { date, business_location } },
        );

        return res.json({ success: true, safe, safeDaily });
      } else {
        return res.status(404).json({ error: "Safe not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
