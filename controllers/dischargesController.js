const { Op } = require("sequelize");
const db = require("../models/index");
const Discharges = db.models.Discharges;
const Daily = db.models.Daily;
const Admin = db.models.Admin;
const { requireBusinessLocation } = require("../middlewares/businessLocation");

module.exports = {
  add: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

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
        business_location,
      });

      res.json({ success: true, discharge });
    } catch (error) {
      throw error;
    }
  },

  getAll: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const discharges = await Discharges.findAll({
        where: { business_location },
        include: [
          { model: Daily, where: { business_location }, required: false },
        ],
        order: [["date", "DESC"]],
      });
      res.json(discharges);
    } catch (error) {
      throw error;
    }
  },

  //TODO: GET BY ADMIN ID
  getByDate: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { startDate, endDate, admin_id } = req.body;

      if (!startDate || !endDate || !admin_id)
        return res.status(400).json("enter all feilds");

      //check admin
      let discharges;

      let admin = await Admin.findByPk(admin_id);
      if (!admin) return res.status(400).json("not authorized");
      //check role is not admin
      if (admin.role !== "admin" && admin.role !== "super admin") {
        discharges = await Discharges.findAll({
          where: {
            date: {
              [Op.between]: [startDate, endDate],
            },
            AdminAdminId: admin_id,
            business_location,
          },
          include: [
            { model: Daily, where: { business_location }, required: false },
          ],
          order: [["date", "DESC"]],
        });
      } else {
        discharges = await Discharges.findAll({
          where: {
            date: {
              [Op.between]: [startDate, endDate],
            },
            business_location,
          },
          include: [
            { model: Daily, where: { business_location }, required: false },
          ],
          order: [["date", "DESC"]],
        });
      }

      res.json(discharges);
    } catch (error) {
      throw error;
    }
  },

  update: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { id, name, price, date, isMonthly, dailyId, payment_method } =
        req.body;
      if (!id) return res.status(400).json("enter id");

      const item = await Discharges.findOne({
        where: { id, business_location },
      });
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
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { id, admin_id: body_admin_id } = req.body;
      const admin_id = body_admin_id || (req.user && req.user.id);

      //check admin
      if (!admin_id) return res.status(400).json("not authorized");
      let admin = await Admin.findByPk(admin_id);
      if (!admin || admin.role !== "admin")
        return res.status(400).json("not authorized");

      if (!id) return res.status(400).json("enter id");

      await Discharges.destroy({ where: { id, business_location } });
      res.json("success");
    } catch (error) {
      throw error;
    }
  },
};
