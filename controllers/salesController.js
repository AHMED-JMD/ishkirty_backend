const db = require("../models/index");
const Bill = db.models.Bill;
const BillTrans = db.models.BillTrans;
const Client = db.models.Client;
const { Op } = require("sequelize");

module.exports = {
  todaysBill: async (req, res) => {
    try {
      const { curr_date } = req.body;

      let bill = await Bill.findAll({
        where: { date: curr_date },
      });

      //send request
      res.json(bill);
    } catch (error) {
      throw error;
    }
  },
  spiecesSales: async (req, res) => {
    try {
      const { start_date, end_date } = req.body;

      if (!start_date || !end_date)
        return res.status(400).json("invalid request body");

      //get bill trans of spices by date
    } catch (error) {
      throw error;
    }
  },
};
