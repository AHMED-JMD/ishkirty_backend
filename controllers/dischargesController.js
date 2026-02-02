const { Op } = require("sequelize");
const db = require("../models/index");
const Discharges = db.models.Discharges;
const Daily = db.models.Daily;
const Admin = db.models.Admin;

module.exports = {
  add: async (req, res) => {
    try {
      const {
        name,
        price,
        date,
        isMonthly,
        dailyId,
        payment_method,
        admin_id,
      } = req.body;

      if (!name || price === undefined || !date || !admin_id)
        return res.status(400).json("enter all feilds");

      //check admin
      let admin = await Admin.findByPk(admin_id);
      if (!admin) return res.status(400).json("not authorized");

      const discharge = await Discharges.create({
        name,
        price: Number(price),
        date,
        isMonthly,
        payment_method: payment_method || "كاش",
        DailyId: dailyId !== undefined ? dailyId : null,
        admin: admin.username,
        AdminAdminId: admin_id,
      });

      res.json({ success: true, discharge });
    } catch (error) {
      throw error;
    }
  },

  getAll: async (req, res) => {
    try {
      const discharges = await Discharges.findAll({
        include: [Daily],
        order: [["date", "DESC"]],
      });
      res.json(discharges);
    } catch (error) {
      throw error;
    }
  },

  getByDate: async (req, res) => {
    try {
      const { startDate, endDate } = req.body;

      const discharges = await Discharges.findAll({
        where: {
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [Daily],
        order: [["date", "DESC"]],
      });

      res.json(discharges);
    } catch (error) {
      throw error;
    }
  },

  update: async (req, res) => {
    try {
      const { id, name, price, date, isMonthly, dailyId, payment_method } =
        req.body;
      if (!id) return res.status(400).json("enter id");

      const item = await Discharges.findByPk(id);
      if (!item) return res.status(400).json("discharge not found");

      await item.update({
        name: name !== undefined ? name : item.name,
        price: price !== undefined ? Number(price) : item.price,
        date: date !== undefined ? date : item.date,
        isMonthly: isMonthly !== undefined ? isMonthly : item.isMonthly,
        payment_method:
          payment_method !== undefined ? payment_method : item.payment_method,
        DailyId: dailyId !== undefined ? dailyId : item.DailyId,
      });

      res.json("success");
    } catch (error) {
      throw error;
    }
  },

  delete: async (req, res) => {
    try {
      const { id, admin_id: body_admin_id } = req.body;
      const admin_id = body_admin_id || (req.user && req.user.id);

      //check admin
      if (!admin_id) return res.status(400).json("not authorized");
      let admin = await Admin.findByPk(admin_id);
      if (!admin || admin.role !== "admin")
        return res.status(400).json("not authorized");

      if (!id) return res.status(400).json("enter id");

      await Discharges.destroy({ where: { id } });
      res.json("success");
    } catch (error) {
      throw error;
    }
  },
};
