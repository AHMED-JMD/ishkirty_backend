const db = require("../models/index");
const Bill = db.models.Bill;
const BillTrans = db.models.BillTrans;
const bcrypt = require("bcryptjs");
const xssFilter = require("xss-filters");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  add: async (req, res) => {
    try {
      let { date, amount, trans, paymentMethod, shiftTime } = req.body;
      //check req.body
      if (!(date && amount && trans && paymentMethod && shiftTime)) {
        return res.status(400).json({ msg: "قم بادخال جميع الحقول" });
      }

      //send the bill to db
      let newbill = await Bill.create({
        amount,
        paymentMethod,
        date,
        shiftTime,
      });

      //add the new bill id to the bill transaction
      trans.map(async (id) => {
        await BillTrans.update(
          { BILLBILLID: newbill.bill_id },
          { where: { id } }
        );
      });

      //send to client
      res.json(newbill);
    } catch (error) {
      throw error;
    }
  },
  addbillTrans: async (req, res) => {
    try {
      let { name, price, quantity } = req.body;
      //check req.body
      if (!(name && price && quantity)) {
        return res.status(400).json("قم بادخال جميع الحقول");
      }

      //send the bill to db
      let amount = parseInt(quantity) * price;
      let billTrans = await BillTrans.create({ name, price, quantity, amount });

      //send to client
      res.json(billTrans);
    } catch (error) {
      throw error;
    }
  },
  getAll: async (req, res) => {
    try {
      let bills = await Bill.findAll({ order: [["date", "DESC"]] });

      //send request
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
  deleteBill: async (req, res) => {
    let { id } = req.body;

    if (!id) return res.status(400).json("enter all feilds");

    //delete from db
    let bill = await Bill.findOne({ where: { bill_id: id } });

    //delete bill trans
    await BillTrans.destroy({ where: { BILLBILLID: id } });

    await Bill.destroy({ where: { bill_id: id } });

    //sent request
    res.json("success");
  },
};
