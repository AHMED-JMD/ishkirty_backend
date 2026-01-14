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

module.exports = {
  add: async (req, res) => {
    try {
      let {
        date,
        amount,
        trans,
        paymentMethod,
        shiftTime,
        clientId,
        admin_id,
      } = req.body;

      //check req.body
      if (!(date && amount && trans && paymentMethod && shiftTime)) {
        return res.status(400).json("الرجاء ادخال جميع الحقول");
      }

      if (trans.length === 0)
        return res.status(400).json("الرجاء اختيار صنف معين");
      //send the bill to db
      let admin = await Admin.findOne({ where: { admin_id } });

      // use a transaction so bill + billTrans + store updates succeed or roll back together
      const t = await sequelize.transaction();
      try {
        let newbill = await Bill.create(
          {
            amount,
            paymentMethod,
            date,
            shiftTime,
            admin: admin.username,
            ClientId: clientId,
            AdminAdminId: admin_id,
          },
          { transaction: t }
        );

        // add the new bill id to the bill transactions and adjust store quantities
        for (const billtran of trans) {
          // create new bill trans
          await BillTrans.create(
            {
              name: billtran.spices,
              price: billtran.unit_price,
              quantity: billtran.counter,
              amount: billtran.total_price,
              date,
              BillId: newbill.id,
            },
            { transaction: t }
          );

          // find the spice by name (front-end sends spice name in billtran.spices)
          const spice = await Spieces.findOne({
            where: { name: billtran.spices },
            transaction: t,
          });
          if (!spice) continue;

          // get store items required for this spice (through SpiceStore)
          const storeItems = await spice.getStores({
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

            // subtract from store quantity using a literal to avoid race conditions
            await Store.update(
              { quantity: sequelize.literal(`quantity - ${totalNeeded}`) },
              { where: { id: si.id }, transaction: t }
            );
          }
        }

        await t.commit();
      } catch (err) {
        await t.rollback();
        throw err;
      }

      //update client id if it is not null
      let client = await Client.findOne({ where: { id: clientId } });

      if (client) {
        //update account
        await Client.update(
          { account: client.account + parseInt(amount) },
          { where: { id: client.id } }
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
      const { isDeleted, todayDate } = req.body;

      //check body
      if (isDeleted === undefined)
        return res.status(400).json("invalid req body");

      //finding and paginating bills from db
      let bills = await Bill.findAll({
        where: {
          isDeleted,
          [Op.or]: [{ date: todayDate }, { updatedAt: todayDate }],
        },
        order: [["date", "DESC"]],
      });

      //send response
      res.json(bills);
    } catch (error) {
      throw error;
    }
  },
  getOne: async (req, res) => {
    try {
      let { bill_id } = req.body;

      //find the bill
      let bill = await Bill.findOne({
        where: { bill_id },
        include: BillTrans,
      });

      //send the bill
      res.json(bill);
    } catch (error) {
      throw error;
    }
  },
  getClientBills: async (req, res) => {
    try {
      const { clientId } = req.body;

      if (!clientId) return res.status(400).json("wrong req feilds");

      let bills = await Bill.findAll({
        where: { ClientId: clientId },
        order: [["date", "DESC"]],
      });

      //send request
      res.json(bills);
    } catch (error) {
      throw error;
    }
  },
  getAdminBills: async (req, res) => {
    try {
      const { admin_id } = req.body;

      if (!admin_id) return res.status(400).json("wrong req feilds");

      let currentDate = new Date();
      //get data from db
      let bills = await Bill.findAll({
        where: { AdminAdminId: admin_id, date: currentDate },
        order: [["date", "DESC"]],
      });

      //send request
      res.json(bills);
    } catch (error) {
      throw error;
    }
  },
  getBillTrans: async (req, res) => {
    try {
      let { billId } = req.body;
      if (!billId) return res.status(400).json("no bill id found");

      //find transaction for the bill
      let billtrans = await BillTrans.findAll({ where: { BillId: billId } });

      //send request
      res.json(billtrans);
    } catch (error) {
      throw error;
    }
  },
  SearchInDates: async (req, res) => {
    try {
      const { start_date, end_date, isDeleted, admin_id } = req.body;

      if (!(start_date && end_date))
        return res.status(400).json("bad request feilds");

      //check admin exist or not
      let bills;
      if (admin_id) {
        //get with admin
        bills = await Bill.findAll({
          where: {
            date: { [Op.between]: [start_date, end_date] },
            isDeleted,
            AdminAdminId: admin_id,
          },
          order: [["date", "DESC"]],
        });
      } else {
        //without admin
        bills = await Bill.findAll({
          where: { date: { [Op.between]: [start_date, end_date] }, isDeleted },
          order: [["date", "DESC"]],
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
      const { comment, id } = req.body;

      if (!(comment && id)) return res.status(400).json("enter all feilds");

      //update db
      await Bill.update(
        {
          comment,
          isDeleted: true,
        },
        {
          where: { id },
          order: [["date", "DESC"]],
        }
      );

      //send request
      res.json("updated bill");
    } catch (error) {
      throw error;
    }
  },
  deleteBillTrans: async (req, res) => {
    const { id } = req.body;
    try {
      let billtrans = await BillTrans.destroy({ where: { id } });

      //send request
      res.json(billtrans);
    } catch (error) {
      throw error;
    }
  },
  deleteBill: async (req, res) => {
    let { id } = req.body;

    if (!id) return res.status(400).json("enter all feilds");

    //delete bill trans
    await BillTrans.destroy({ where: { BillId: id } });

    //delete from db
    await Bill.destroy({ where: { id } });

    //sent request
    res.json("success");
  },
};
