const db = require("../models/index");
const { Op } = require("sequelize");

const Admin = db.models.Admin;
const BusinessLocation = db.models.BusinessLocation;
const Daily = db.models.Daily;
const Bill = db.models.Bill;
const BillTrans = db.models.BillTrans;
const Category = db.models.Category;
const Client = db.models.Client;
const Employee = db.models.Employee;
const EmpTrans = db.models.EmpTrans;
const PurchaseRequest = db.models.PurchaseRequest;
const Discharges = db.models.Discharges;
const Safe = db.models.Safe;
const SafeDailies = db.models.SafeDailies;
const SafeTransfers = db.models.SafeTransfers;
const SpiceStore = db.models.SpiceStore;
const Spieces = db.models.Spieces;
const Store = db.models.Store;
const Transfer = db.models.Transfer;

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
        where: { name: { [Op.ne]: "remote" } },
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

      const admin = await Admin.findByPk(req.user?.id);
      if (!admin) return res.status(401).json("Not Authorized");
      if (admin.role !== "super admin") {
        return res.status(403).json("super admin required");
      }

      const location = await BusinessLocation.findByPk(name);
      if (!location) return res.status(404).json("location not found");

      await db.sequelize.transaction(async (transaction) => {
        await BillTrans.destroy({
          where: { business_location: name },
          transaction,
        });
        await SpiceStore.destroy({
          where: { business_location: name },
          transaction,
        });
        await EmpTrans.destroy({
          where: { business_location: name },
          transaction,
        });
        await PurchaseRequest.destroy({
          where: { business_location: name },
          transaction,
        });
        await Discharges.destroy({
          where: { business_location: name },
          transaction,
        });
        await SafeDailies.destroy({
          where: { business_location: name },
          transaction,
        });
        await SafeTransfers.destroy({
          where: { business_location: name },
          transaction,
        });
        await Bill.destroy({ where: { business_location: name }, transaction });
        await Transfer.destroy({
          where: { business_location: name },
          transaction,
        });
        await Daily.destroy({
          where: { business_location: name },
          transaction,
        });
        await Employee.destroy({
          where: { business_location: name },
          transaction,
        });
        await Store.destroy({
          where: { business_location: name },
          transaction,
        });
        await Safe.destroy({ where: { business_location: name }, transaction });
        await Spieces.destroy({
          where: { business_location: name },
          transaction,
        });
        await Category.destroy({
          where: { business_location: name },
          transaction,
        });
        await Client.destroy({
          where: { business_location: name },
          transaction,
        });
        await Admin.destroy({
          where: { business_location: name },
          transaction,
        });
        await BusinessLocation.destroy({ where: { name }, transaction });
      });

      res.json("location and all related data deleted");
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
        order: [["date", "DESC"]],
      });

      res.json(dailies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
