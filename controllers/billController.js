const db = require("../models/index");
const Bill = db.models.Bill;
const Spieces = db.models.Spieces;
const bcrypt = require("bcryptjs");
const xssFilter = require("xss-filters");
const jwt = require("jsonwebtoken");
require("dotenv").config();

let admin = {
  add: async (req, res) => {
    try {
      let { date, amount, spieces_id, paymentMethod } = req.body;
      //check req.body
      if (!(date && amount && spieces_id && paymentMethod)) {
        return res.status(400).json({ msg: "قم بادخال جميع الحقول" });
      }

      //make sure the bill is not added before
      let bill = await Bill.findOne({ where: { spieces_id } });
      if (bill) return res.status(400).json("bill already exist");

      //---------// add Spieces id to bill here----------------

      //----------------------------------------------------------------

      //send the bill to db
      let newbill = await Bill.create({ amount, paymentMethod, date });

      //send to client
      res.json(newbill);
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
      let bill = Bill.findOne({
        where: { bill_id },
      });

      //find all sepieces
      let spieces = await Spieces.finAll();

      //send the bill
      res.json(bill);
    } catch (error) {
      throw error;
    }
  },
  deleteBill: async (req, res) => {
    if (!req.body) return res.status(400).json("enter all feilds");

    //delete from db
    await Bill.destroy({ bill_id: req.body });

    //sent request
    res.json("success");
  },
};

module.exports = admin;
