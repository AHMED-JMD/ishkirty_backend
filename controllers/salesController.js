const getSum = require("../middlewares/getSum");
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
        where: { date: curr_date, isDeleted: false },
      });

      //send request
      res.json(bill);
    } catch (error) {
      throw error;
    }
  },
  spiecesSales: async (req, res) => {
    try {
      const { name, curr_date, week_date, month_date } = req.body;

      if (!(name && week_date && month_date && curr_date))
        return res.status(400).json("invalid request body");

      //get bill trans of spices by date and name
      //#todays sales
      let today_sales = await BillTrans.findAll({
        where: { name, date: curr_date },
      });
      //#todays sales
      let week_sales = await BillTrans.findAll({
        where: { name, date: { [Op.between]: [week_date, curr_date] } },
      });
      //#todays sales
      let month_sales = await BillTrans.findAll({
        where: { name, date: { [Op.between]: [month_date, curr_date] } },
      });

      //getting each total of sales
      let total_day_sales = getSum(today_sales);
      let total_week_sales = getSum(week_sales);
      let total_month_sales = getSum(month_sales);

      //send response
      res.json({
        total_day_sales,
        total_week_sales,
        total_month_sales,
      });
    } catch (error) {
      throw error;
    }
  },
  searchedSales: async (req, res) => {
    try {
      const { name, start_date, end_date } = req.body;

      if (!(name && start_date && end_date))
        return res.status(400).json("invalid request body");

      //get bill trans of spices by date and name
      //#searched sales
      let searchedSales = await BillTrans.findAll({
        where: { name, date: { [Op.between]: [start_date, end_date] } },
      });

      //getting each total of sales
      let total_searched_sales = getSum(searchedSales);

      //send response
      res.json({
        total_searched_sales,
      });
    } catch (error) {
      throw error;
    }
  },
};
