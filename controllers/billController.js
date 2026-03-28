const db = require("../models/index");
const Bill = db.models.Bill;
const Admin = db.models.Admin;
const BillTrans = db.models.BillTrans;
const Client = db.models.Client;
const Spieces = db.models.Spieces;
const Store = db.models.Store;
const SpiceStore = db.models.SpiceStore;
const sequelize = db.sequelize;

const { Op } = require("sequelize");
const { requireBusinessLocation } = require("../middlewares/businessLocation");

module.exports = {
  add: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      let {
        bill_counter,
        date,
        amount,
        trans,
        paymentMethod,
        paymentMethods,
        shiftTime,
        type,
        clientId,
        admin_id,
        isDelivery = false,
        delivery_cost = 0,
        delivery_address = "",
      } = req.body;

      //check req.body
      // require either a single paymentMethod or paymentMethods array; amount is optional
      if (
        !(
          bill_counter &&
          date &&
          trans &&
          shiftTime &&
          type &&
          admin_id &&
          (paymentMethod || (paymentMethods && Array.isArray(paymentMethods)))
        )
      ) {
        return res.status(400).json("الرجاء ادخال جميع الحقول");
      }

      if (trans.length === 0)
        return res.status(400).json("الرجاء اختيار صنف معين");

      //check admin exist or not
      let admin = await Admin.findOne({ where: { admin_id } });
      if (!admin) {
        return res.status(400).json("المسؤول غير موجود");
      }

      // If multiple paymentMethods provided, compute total amount from it
      if (
        paymentMethods &&
        Array.isArray(paymentMethods) &&
        paymentMethods.length > 0
      ) {
        const totalFromMethods = paymentMethods.reduce(
          (sum, p) => sum + (parseFloat(p.amount) || 0),
          0,
        );
        amount = parseFloat(totalFromMethods || amount || 0);
      }

      // If delivery, add delivery_cost to amount
      if (isDelivery && delivery_cost) {
        amount = parseFloat(amount || 0) + parseFloat(delivery_cost || 0);
      }

      // use a transaction so bill + billTrans + store updates succeed or roll back together
      const t = await sequelize.transaction();
      try {
        // validate type value
        const allowedTypes = ["محلي", "سفري", "استلام", "توصيل"];
        if (type && !allowedTypes.includes(type)) {
          await t.rollback();
          return res.status(400).json("نوع الفاتورة غير صالح");
        }

        // prepare bill payload
        const billPayload = {
          bill_counter,
          amount,
          type,
          date,
          shiftTime,
          admin: admin.username,
          ClientId: clientId,
          AdminAdminId: admin_id,
          isDelivery: !!isDelivery,
          delivery_cost: delivery_cost || 0,
          delivery_address: delivery_address || "",
          business_location,
        };

        // persist paymentMethods JSON when provided; keep single paymentMethod for compatibility
        if (
          paymentMethods &&
          Array.isArray(paymentMethods) &&
          paymentMethods.length > 0
        ) {
          billPayload.paymentMethods = paymentMethods;
          billPayload.paymentMethod =
            paymentMethods.length === 1 ? paymentMethods[0].method : null;
        } else if (paymentMethod) {
          billPayload.paymentMethod = paymentMethod;
        }

        let newbill = await Bill.create(billPayload, { transaction: t });

        // add the new bill id to the bill transactions and adjust store quantities
        for (const billtran of trans) {
          // find the spice by name (front-end sends spice name in billtran.spices)
          const spice = await Spieces.findOne({
            where: { name: billtran.spices, business_location },
            transaction: t,
          });
          if (!spice) continue;

          // get store items required for this spice (through SpiceStore)
          const storeItems = await spice.getStores({
            where: { business_location },
            joinTableAttributes: ["quantityNeeded"],
            transaction: t,
          });

          // decrement each related store item by quantityNeeded * sold quantity
          for (const si of storeItems) {
            const neededPerUnit =
              si.SpiceStore && si.SpiceStore.quantityNeeded
                ? parseFloat(si.SpiceStore.quantityNeeded)
                : 0;
            const soldCount = Number(billtran.counter || 0);
            let totalNeeded = neededPerUnit * soldCount;

            //check if it's kilos
            if (si.isKilo) {
              totalNeeded = totalNeeded / 1000;
            }

            if (totalNeeded === 0) continue;

            //-----------------for safe store valueing -------------
            if (
              si.quantity < totalNeeded
              // si.warn_value >= si.quantity ||
              // si.warn_value >= si.quantity - totalNeeded
            ) {
              await t.rollback();
              return res
                .status(400)
                .json(`كمية ${si.name} في المخزن غير كافية`);
            }

            // subtract from store quantity using a literal to avoid race conditions
            await Store.update(
              { quantity: sequelize.literal(`quantity - ${totalNeeded}`) },
              { where: { id: si.id }, transaction: t },
            );
          }

          // create new bill trans---------
          await BillTrans.create(
            {
              name: billtran.spices,
              price: billtran.unit_price,
              quantity: billtran.counter,
              amount: billtran.total_price,
              date,
              BillId: newbill.id,
              SpieceId: spice.id,
              business_location,
            },
            { transaction: t },
          );
        }

        await t.commit();
      } catch (err) {
        await t.rollback();
        throw err;
      }

      //update client id if it is not null
      let client = await Client.findOne({
        where: { id: clientId, business_location },
      });

      if (client) {
        //update account
        await Client.update(
          { account: client.account + parseInt(amount) },
          { where: { id: client.id, business_location } },
        );
      }

      //send to client
      res.json("created new bill successfully");
    } catch (error) {
      throw error;
    }
  },
  getAll: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { isDeleted, todayDate, admin_id } = req.body;

      //check body
      if (isDeleted === undefined || !todayDate || !admin_id)
        return res.status(400).json("invalid req body");

      //check admin exist or not
      let admin = await Admin.findOne({ where: { admin_id } });
      if (!admin) {
        return res.status(400).json("المسؤول غير موجود");
      }

      //finding and paginating bills from db
      let bills;
      if (admin.role !== "admin" && admin.role !== "super admin") {
        bills = await Bill.findAll({
          where: {
            isDeleted,
            AdminAdminId: admin_id,
            [Op.or]: [{ date: todayDate }, { updatedAt: todayDate }],
            business_location,
          },
          order: [["id", "DESC"]],
        });
      } else {
        bills = await Bill.findAll({
          where: {
            isDeleted,
            [Op.or]: [{ date: todayDate }, { updatedAt: todayDate }],
            business_location,
          },
          order: [["id", "DESC"]],
        });
      }

      //send response
      res.json(bills);
    } catch (error) {
      throw error;
    }
  },
  getOne: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      let { bill_id } = req.body;

      //find the bill
      let bill = await Bill.findOne({
        where: { id: bill_id, business_location },
        include: [
          {
            model: BillTrans,
            where: { business_location },
            required: false,
          },
        ],
      });

      //send the bill
      res.json(bill);
    } catch (error) {
      throw error;
    }
  },
  getClientBills: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { clientId } = req.body;

      if (!clientId) return res.status(400).json("wrong req feilds");

      let bills = await Bill.findAll({
        where: { ClientId: clientId, business_location },
        order: [["id", "DESC"]],
      });

      //send request
      res.json(bills);
    } catch (error) {
      throw error;
    }
  },
  getAdminBills: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { admin_id } = req.body;

      if (!admin_id) return res.status(400).json("wrong req feilds");

      let currentDate = new Date();
      //get data from db
      let bills = await Bill.findAll({
        where: { AdminAdminId: admin_id, date: currentDate, business_location },
        order: [["id", "DESC"]],
      });

      //send request
      res.json(bills);
    } catch (error) {
      throw error;
    }
  },
  getBillTrans: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      let { billId } = req.body;
      if (!billId) return res.status(400).json("no bill id found");

      //find transaction for the bill
      let billtrans = await BillTrans.findAll({
        where: { BillId: billId, business_location },
      });

      //send request
      res.json(billtrans);
    } catch (error) {
      throw error;
    }
  },
  SearchInDates: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { start_date, end_date, isDeleted, admin_id } = req.body;

      if (!(start_date && end_date))
        return res.status(400).json("bad request feilds");

      //check admin exist or not
      //check admin exist or not
      let admin = await Admin.findOne({ where: { admin_id } });
      if (!admin) {
        return res.status(400).json("المسؤول غير موجود");
      }

      let bills;
      if (admin.role !== "admin" && admin.role !== "super admin") {
        //get with admin
        bills = await Bill.findAll({
          where: {
            date: { [Op.between]: [start_date, end_date] },
            isDeleted,
            AdminAdminId: admin_id,
            business_location,
          },
          order: [["id", "DESC"]],
        });
      } else {
        //without admin
        bills = await Bill.findAll({
          where: {
            date: { [Op.between]: [start_date, end_date] },
            isDeleted,
            business_location,
          },
          order: [["id", "DESC"]],
        });
      }

      //send request
      if (bills.length != 0) {
        res.json(bills);
      } else {
        res.status(400).json("no bills in these days");
      }
    } catch (error) {
      throw error;
    }
  },
  deletedBillsUpdate: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { comment, id } = req.body;

      if (!(comment && id)) return res.status(400).json("enter all feilds");
      //update store quantity
      const t = await sequelize.transaction();
      try {
        let trans = await BillTrans.findAll({
          where: { BillId: id, business_location },
          transaction: t,
        });

        for (const billtran of trans) {
          // find the spice by name (front-end sends spice name in billtran.spices)
          const spice = await Spieces.findOne({
            where: { name: billtran.name, business_location },
            transaction: t,
          });
          if (!spice) continue;

          // get store items required for this spice (through SpiceStore)
          const storeItems = await spice.getStores({
            where: { business_location },
            joinTableAttributes: ["quantityNeeded"],
            transaction: t,
          });

          // increment each related store item by quantityNeeded * sold quantity
          for (const si of storeItems) {
            const neededPerUnit =
              si.SpiceStore && si.SpiceStore.quantityNeeded
                ? parseFloat(si.SpiceStore.quantityNeeded)
                : 0;
            const soldCount = Number(billtran.quantity || 0);
            let totalNeeded = neededPerUnit * soldCount;

            //check if it's kilos
            if (si.isKilo) {
              totalNeeded = totalNeeded / 1000;
            }
            if (totalNeeded === 0) continue;

            // add back to store quantity using a literal to avoid race conditions
            await Store.update(
              { quantity: sequelize.literal(`quantity + ${totalNeeded}`) },
              { where: { id: si.id }, transaction: t },
            );
          }
        }

        //update db
        await Bill.update(
          {
            comment,
            isDeleted: true,
          },
          {
            where: { id, business_location },
            order: [["id", "DESC"]],
            transaction: t,
          },
        );

        await t.commit();
      } catch (err) {
        await t.rollback();
        throw err;
      }

      //send request
      res.json("updated bill");
    } catch (error) {
      throw error;
    }
  },
  deleteBillTrans: async (req, res) => {
    const { id } = req.body;
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      let billtrans = await BillTrans.destroy({
        where: { id, business_location },
      });

      //send request
      res.json(billtrans);
    } catch (error) {
      throw error;
    }
  },
  deleteBill: async (req, res) => {
    const business_location = requireBusinessLocation(req, res);
    if (!business_location) return;

    let { id } = req.body;

    if (!id) return res.status(400).json("enter all feilds");

    //delete bill trans
    await BillTrans.destroy({ where: { BillId: id, business_location } });

    //delete from db
    await Bill.destroy({ where: { id, business_location } });

    //sent request
    res.json("success");
  },
};
