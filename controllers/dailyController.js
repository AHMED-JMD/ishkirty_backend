const db = require("../models/index");
const { Op } = require("sequelize");
const Sequelize = require("sequelize");
const admin = require("../models/admin");

const Daily = db.models.Daily;
const Safe = db.models.Safe;
const SafeDailies = db.models.SafeDailies;
const Bill = db.models.Bill;
const EmpTrans = db.models.EmpTrans;
const PurchaseRequest = db.models.PurchaseRequest;
const Discharges = db.models.Discharges;
const Admin = db.models.Admin;

module.exports = {
  add: async (req, res) => {
    try {
      const {
        date,
        cash_sales,
        bank_sales,
        fawry_sales,
        account_sales,
        today_costs,
        cash_costs,
        bank_costs,
        fawry_costs,
        account_costs,
        admin_id,
      } = req.body;

      if (!date || !admin_id) return res.status(400).json("enter all fields");

      //check admin exists
      const admin = await Admin.findByPk(admin_id);
      if (!admin) return res.status(400).json("admin not found");

      //find daily
      let daily = await Daily.findOne({ where: { date } });

      if (daily) {
        if (admin.role !== "admin" && daily.AdminAdminId !== admin.admin_id) {
          return res.status(403).json("ليس لديك صلاحية تعديل هذه اليومية");
        }
        //update existing one
        await Daily.update(
          {
            date,
            cash_sales: cash_sales !== undefined ? Number(cash_sales) : 0.0,
            bank_sales: bank_sales !== undefined ? Number(bank_sales) : 0.0,
            fawry_sales: fawry_sales !== undefined ? Number(fawry_sales) : 0.0,
            account_sales:
              account_sales !== undefined ? Number(account_sales) : 0.0,
            spices_costs: today_costs !== undefined ? Number(today_costs) : 0.0,
            cash_costs: cash_costs !== undefined ? Number(cash_costs) : 0.0,
            bank_costs: bank_costs !== undefined ? Number(bank_costs) : 0.0,
            fawry_costs: fawry_costs !== undefined ? Number(fawry_costs) : 0.0,
            account_costs:
              account_costs !== undefined ? Number(account_costs) : 0.0,
            AdminAdminId: admin.admin_id,
            isCreated: true,
          },
          { where: { date } },
        );

        //update bills
        await Bill.update(
          {
            DailyId: daily.id,
          },
          { where: { date } },
        );

        //update employee trans
        await EmpTrans.update(
          {
            DailyId: daily.id,
          },
          { where: { date } },
        );

        //update purchase requests
        await PurchaseRequest.update(
          {
            DailyId: daily.id,
          },
          { where: { date } },
        );

        //update discharges
        await Discharges.update(
          {
            DailyId: daily.id,
          },
          { where: { date } },
        );

        res.json("تم تعديل اليومية بنجاح");
      } else {
        //create new one

        let newDaily = await Daily.create({
          date,
          cash_sales: cash_sales !== undefined ? Number(cash_sales) : 0.0,
          bank_sales: bank_sales !== undefined ? Number(bank_sales) : 0.0,
          fawry_sales: fawry_sales !== undefined ? Number(fawry_sales) : 0.0,
          account_sales:
            account_sales !== undefined ? Number(account_sales) : 0.0,
          spices_costs: today_costs !== undefined ? Number(today_costs) : 0.0,
          cash_costs: cash_costs !== undefined ? Number(cash_costs) : 0.0,
          bank_costs: bank_costs !== undefined ? Number(bank_costs) : 0.0,
          fawry_costs: fawry_costs !== undefined ? Number(fawry_costs) : 0.0,
          account_costs:
            account_costs !== undefined ? Number(account_costs) : 0.0,
          AdminAdminId: admin.admin_id,
          isCreated: true,
        });

        //update bills
        await Bill.update(
          {
            DailyId: newDaily.id,
          },
          { where: { date } },
        );

        //update employee trans
        await EmpTrans.update(
          {
            DailyId: newDaily.id,
          },
          { where: { date } },
        );

        //update purchase requests
        await PurchaseRequest.update(
          {
            DailyId: newDaily.id,
          },
          { where: { date } },
        );

        //update discharges
        await Discharges.update(
          {
            DailyId: newDaily.id,
          },
          { where: { date } },
        );

        res.json("تم انشاء اليومية بنجاح");
      }
    } catch (error) {
      throw error;
    }
  },

  getAll: async (req, res) => {
    try {
      const dailies = await Daily.findAll({
        include: [Bill, EmpTrans, PurchaseRequest, Discharges],
        order: [["date", "DESC"]],
      });
      res.json(dailies);
    } catch (error) {
      throw error;
    }
  },

  getByDate: async (req, res) => {
    try {
      const { startDate, endDate, admin_id } = req.body;

      if (!admin_id) return res.status(400).json("enter admin_id");

      //check admin exists
      const admin = await Admin.findByPk(admin_id);
      if (!admin) return res.status(400).json("admin not found");

      let dailies;
      const adminInclude = { model: Admin, attributes: ["username"] };
      if (admin.role !== "admin") {
        // only created dailies for non-admins
        dailies = await Daily.findAll({
          where: {
            date: {
              [Op.between]: [startDate, endDate],
            },
            isCreated: true,
          },
          include: [adminInclude],
          order: [["date", "DESC"]],
        });
      } else {
        //all dailies for admins
        dailies = await Daily.findAll({
          where: {
            date: {
              [Op.between]: [startDate, endDate],
            },
          },
          include: [adminInclude],
          order: [["date", "DESC"]],
        });
      }

      res.json(dailies);
    } catch (error) {
      throw error;
    }
  },

  getOne: async (req, res) => {
    try {
      const { date, admin_id } = req.body;
      if (!date || !admin_id) return res.status(400).json("enter all fields");

      //check admin exists
      const admin = await Admin.findByPk(admin_id);
      if (!admin) return res.status(400).json("admin not found");

      let dailies;
      if (admin.role !== "admin") {
        dailies = await Daily.findOne({
          where: {
            date,
            AdminAdminId: admin_id,
          },
          order: [["date", "DESC"]],
        });
      } else {
        dailies = await Daily.findOne({
          where: {
            date,
          },
          include: [EmpTrans, PurchaseRequest, Discharges],
          order: [["date", "DESC"]],
        });
      }

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
        today_sales:
          today_sales !== undefined ? Number(today_sales) : item.today_sales,
        today_costs:
          today_costs !== undefined ? Number(today_costs) : item.today_costs,
      });

      res.json("success");
    } catch (error) {
      throw error;
    }
  },

  delete: async (req, res) => {
    try {
      const { id, date } = req.body;
      if (!id || !date) return res.status(400).json("enter id and date");

      const t = await db.sequelize.transaction();
      try {
        // revert emp transactions (update employee salary and delete transactions)
        const empTransList = await EmpTrans.findAll({
          where: { [Op.or]: [{ date }, { DailyId: id }] },
        });

        for (const tr of empTransList) {
          const emp = await db.models.Employee.findByPk(tr.EmployeeId, {
            transaction: t,
          });
          if (emp) {
            const amt = Number(tr.amount || 0);
            let newSalary = Number(emp.salary || 0);
            if (tr.type === "اضافة") newSalary -= amt;
            else newSalary += amt;
            if (newSalary < 0) newSalary = 0;
            await emp.update({ salary: newSalary }, { transaction: t });
          }
          await tr.destroy({ transaction: t });
        }

        // revert purchases (reduce store quantity) and delete purchases
        const purchases = await PurchaseRequest.findAll({
          where: { [Op.or]: [{ date }, { DailyId: id }] },
        });

        for (const p of purchases) {
          const store = await db.models.Store.findByPk(p.StoreId, {
            transaction: t,
          });
          if (store) {
            const newQty = Number(store.quantity) - Number(p.net_quantity || 0);
            await store.update(
              { quantity: newQty < 0 ? 0 : newQty },
              { transaction: t },
            );
          }
          await p.destroy({ transaction: t });
        }

        // delete discharges related to this daily
        await Discharges.destroy({
          where: { [Op.or]: [{ date }, { DailyId: id }] },
          transaction: t,
        });

        //delete safe daily and revert safe amounts
        const safeDaily = await SafeDailies.findOne({ where: { DailyId: id } });

        if (safeDaily) {
          // Get the associated Safe
          const safe = await Safe.findByPk(safeDaily.SafeId);
          if (!safe) {
            return res.status(404).json({ error: "Associated Safe not found" });
          }
          // Deduct the totals from the Safe
          await safe.update(
            {
              cash_amount: safe.cash_amount - safeDaily.total_cash,
              bank_amount: safe.bank_amount - safeDaily.total_bank,
              fawry_amount: safe.fawry_amount - safeDaily.total_fawry,
              dept_amount: safe.dept_amount - safeDaily.total_dept,
            },
            { transaction: t },
          );

          await safeDaily.destroy({ transaction: t });
        }
      } catch (err) {
        await t.rollback();
        throw err;
      }

      try {
        // finally delete the daily
        await Daily.destroy({ where: { id, date }, transaction: t });

        await t.commit();
        res.json({ success: true });
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } catch (error) {
      throw error;
    }
  },

  unlockDaily: async (req, res) => {
    try {
      const { id, date } = req.body;
      if (!id || !date) return res.status(400).json("enter id and date");

      await Daily.update({ isCreated: false }, { where: { id, date } });

      res.json("success");
    } catch (error) {
      throw error;
    }
  },

  SyncDB: async (req, res) => {
    try {
      const { admin_id } = req.body;
      if (!admin_id) return res.status(400).json("enter admin_id");

      // verify admin exists locally
      const Admin = db.models.Admin;
      const admin = await Admin.findByPk(admin_id);
      if (!admin) return res.status(400).json("admin not found");

      // read online DB connection from env
      const {
        ONLINE_DBNAME,
        ONLINE_DBUSER,
        ONLINE_DBPASSWORD,
        ONLINE_DBHOST,
        ONLINE_DIALECT,
      } = process.env;

      if (
        !ONLINE_DBNAME ||
        !ONLINE_DBUSER ||
        !ONLINE_DBHOST ||
        !ONLINE_DIALECT
      ) {
        return res.status(500).json("online DB env vars not configured");
      }

      // create remote sequelize
      const remoteSequelize = new Sequelize(
        ONLINE_DBNAME,
        ONLINE_DBUSER,
        ONLINE_DBPASSWORD,
        {
          host: ONLINE_DBHOST,
          dialect: ONLINE_DIALECT,
          logging: false,
          pool: { max: 10, min: 0, acquire: 60000, idle: 10000 },
          dialectOptions: { connectTimeout: 60000 },
          retry: { max: 3 },
        },
      );

      // helper: authenticate with retries + exponential backoff
      async function connectWithRetry(sequelize, retries = 3) {
        let attempt = 0;
        while (attempt <= retries) {
          try {
            await sequelize.authenticate();
            return;
          } catch (err) {
            attempt++;
            if (attempt > retries) throw err;
            await new Promise((r) =>
              setTimeout(r, 1000 * Math.pow(2, attempt)),
            );
          }
        }
      }

      // attempt connection to remote DB before proceeding
      await connectWithRetry(remoteSequelize, 3);

      // initialize remote models (same as models/index.js)
      const RemoteAdmin = require("../models/admin")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteClient = require("../models/client")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteSpieces = require("../models/spieces")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteBill = require("../models/bill")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteBillTrans = require("../models/billTrans")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteTransfer = require("../models/transfer")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteStore = require("../models/store")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteSpiceStore = require("../models/spiceStore")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemotePurchaseRequest = require("../models/purchaseRequest")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteEmployee = require("../models/employee")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteEmpTrans = require("../models/empTrans")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteDischarges = require("../models/discharges")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteDaily = require("../models/daily")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteSafe = require("../models/safe")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteSafeDailies = require("../models/safeDailies")(
        remoteSequelize,
        Sequelize.DataTypes,
      );
      const RemoteSafeTransfers = require("../models/safeTransfers")(
        remoteSequelize,
        Sequelize.DataTypes,
      );

      // remote relations (minimal for FK compatibility)
      RemoteBill.hasMany(RemoteBillTrans);
      RemoteBillTrans.belongsTo(RemoteBill);
      RemoteSpieces.hasMany(RemoteBillTrans);
      RemoteBillTrans.belongsTo(RemoteSpieces);
      RemoteClient.hasMany(RemoteBill);
      RemoteBill.belongsTo(RemoteClient);
      RemoteAdmin.hasMany(RemoteBill);
      RemoteBill.belongsTo(RemoteAdmin);
      RemoteAdmin.hasMany(RemoteTransfer);
      RemoteTransfer.belongsTo(RemoteAdmin);
      RemoteSpieces.belongsToMany(RemoteStore, { through: RemoteSpiceStore });
      RemoteStore.belongsToMany(RemoteSpieces, { through: RemoteSpiceStore });
      RemoteSpiceStore.belongsTo(RemoteStore, { foreignKey: "StoreId" });
      RemoteSpiceStore.belongsTo(RemoteSpieces, { foreignKey: "SpieceId" });
      RemotePurchaseRequest.belongsTo(RemoteStore, { foreignKey: "StoreId" });
      RemoteStore.hasMany(RemotePurchaseRequest, { foreignKey: "StoreId" });
      RemoteDaily.hasMany(RemoteBill);
      RemoteBill.belongsTo(RemoteDaily, { foreignKey: "DailyId" });
      RemoteDaily.hasMany(RemoteEmpTrans);
      RemoteEmpTrans.belongsTo(RemoteDaily, { foreignKey: "DailyId" });
      RemoteDaily.hasMany(RemotePurchaseRequest);
      RemotePurchaseRequest.belongsTo(RemoteDaily, { foreignKey: "DailyId" });
      RemoteDaily.hasMany(RemoteDischarges);
      RemoteDischarges.belongsTo(RemoteDaily, { foreignKey: "DailyId" });
      RemoteEmployee.hasMany(RemoteEmpTrans);
      RemoteEmpTrans.belongsTo(RemoteEmployee);

      // Safe and Daily many-to-many relation through SafeDailies
      RemoteSafe.belongsToMany(RemoteDaily, {
        through: RemoteSafeDailies,
        foreignKey: "SafeId",
        otherKey: "DailyId",
        as: "dailys",
      });
      RemoteDaily.belongsToMany(RemoteSafe, {
        through: RemoteSafeDailies,
        foreignKey: "DailyId",
        otherKey: "SafeId",
        as: "safes",
      });

      // SafeTransfers relation
      RemoteSafe.hasMany(RemoteSafeTransfers, {
        foreignKey: "SafeId",
        as: "safeTransfers",
      });
      RemoteSafeTransfers.belongsTo(RemoteSafe, {
        foreignKey: "SafeId",
        as: "safe",
      });

      // sync remote structure (create tables if missing)
      await remoteSequelize.sync();

      // prepare insertion order to respect FKs=(foreign keys)
      const order = [
        { local: db.models.Admin, remote: RemoteAdmin },
        { local: db.models.Client, remote: RemoteClient },
        { local: db.models.Spieces, remote: RemoteSpieces },
        { local: db.models.Store, remote: RemoteStore },
        { local: db.models.SpiceStore, remote: RemoteSpiceStore },
        { local: db.models.Employee, remote: RemoteEmployee },
        { local: db.models.Daily, remote: RemoteDaily },
        { local: db.models.Bill, remote: RemoteBill },
        { local: db.models.BillTrans, remote: RemoteBillTrans },
        { local: db.models.Transfer, remote: RemoteTransfer },
        { local: db.models.PurchaseRequest, remote: RemotePurchaseRequest },
        { local: db.models.EmpTrans, remote: RemoteEmpTrans },
        { local: db.models.Discharges, remote: RemoteDischarges },
        { local: db.models.Safe, remote: RemoteSafe },
        { local: db.models.SafeDailies, remote: RemoteSafeDailies },
        { local: db.models.SafeTransfers, remote: RemoteSafeTransfers },
      ];

      // run sync in a remote transaction
      const t = await remoteSequelize.transaction();
      try {
        // disable FK checks for MySQL to allow truncation/order-free inserts
        if (ONLINE_DIALECT && ONLINE_DIALECT.toLowerCase().includes("mysql")) {
          await remoteSequelize.query("SET FOREIGN_KEY_CHECKS=0;", {
            transaction: t,
          });
        }

        // truncate remote tables then bulk insert local data
        for (const m of order) {
          const localRows = await m.local.findAll({ raw: true });
          await m.remote.destroy({
            where: {},
            truncate: true,
            force: true,
            transaction: t,
          });
          if (localRows && localRows.length > 0) {
            await m.remote.bulkCreate(localRows, { transaction: t });
          }
        }

        if (ONLINE_DIALECT && ONLINE_DIALECT.toLowerCase().includes("mysql")) {
          await remoteSequelize.query("SET FOREIGN_KEY_CHECKS=1;", {
            transaction: t,
          });
        }

        await t.commit();
      } catch (err) {
        await t.rollback();
        throw err;
      } finally {
        await remoteSequelize.close();
      }

      res.json("sync complete");
    } catch (error) {
      throw error;
    }
  },
};
