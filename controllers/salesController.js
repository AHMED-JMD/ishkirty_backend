const { getSum, total_sales } = require("../middlewares/getSum");
const db = require("../models/index");
const Bill = db.models.Bill;
const Spieces = db.models.Spieces;
const BillTrans = db.models.BillTrans;
const { Op } = require("sequelize");

module.exports = {
  totalSales: async (req, res) => {
    try {
      const { start_date, end_date } = req.body;

      let bill = await Bill.findAll({
        where: {
          date: { [Op.between]: [start_date, end_date] },
          isDeleted: false,
        },
      });

      //morning sales
      const cashMor = total_sales(bill, "كاش", "صباحية");
      const bankMor = total_sales(bill, "بنكك", "صباحية");
      const accountMor = total_sales(bill, "حساب", "صباحية");
      const totalMor = cashMor + bankMor + accountMor;

      //evening sales
      const cashEv = total_sales(bill, "كاش", "مسائية");
      const bankEv = total_sales(bill, "بنكك", "مسائية");
      const accountEv = total_sales(bill, "حساب", "مسائية");
      const totalEv = cashEv + bankEv + accountEv;

      //send request
      res.json({
        cashMor,
        bankMor,
        accountMor,
        totalMor,
        cashEv,
        bankEv,
        accountEv,
        totalEv,
      });
    } catch (error) {
      throw error;
    }
  },
  spiecesSales: async (req, res) => {
    try {
      const { name, curr_date, week_date, month_date } = req.body;

      if (!(name && week_date && month_date && curr_date))
        return res.status(400).json("invalid request body");

      //#todays sales
      let today_sales = await BillTrans.findAll({
        where: { name, date: curr_date },
      });
      //#weeks sales
      let week_sales = await BillTrans.findAll({
        where: { name, date: { [Op.between]: [week_date, curr_date] } },
      });
      //#months sales
      let month_sales = await BillTrans.findAll({
        where: { name, date: { [Op.between]: [month_date, curr_date] } },
      });

      //getting each total of sales
      let total_day_sales = getSum(today_sales);
      let total_week_sales = getSum(week_sales);
      let total_month_sales = getSum(month_sales);

      //send response
      res.json({
        total_day_sales: total_day_sales.sum,
        total_week_sales: total_week_sales.sum,
        total_month_sales: total_month_sales.sum,
      });
    } catch (error) {
      throw error;
    }
  },
  allSpicesSales: async (req, res) => {
    try {
      const { start_date, end_date } = req.body;

      if (!(start_date && end_date))
        return res.status(400).json("invalid request body");

      //get all spices
      const spieces = await Spieces.findAll({ order: [["price", "DESC"]] });

      //get the sum of each spice sales
      const modSpieces = await Promise.all(
        spieces.map(async (type) => {
          //get all bill trans of a spice
          const bills = await BillTrans.findAll({
            where: {
              name: type.name,
              date: { [Op.between]: [start_date, end_date] },
            },
            include: [
              {
                model: Bill,
                where: { isDeleted: false },
                attributes: [], // don't need Bill fields in result
                required: true, // inner join: only BillTrans with a matching Bill
              },
            ],
          });
          //get total sales of the spice
          const sales = getSum(bills);

          return {
            name: type.name,
            category: type.category,
            tot_sales: sales.revenue,
            ImgLink: type.ImgLink,
          };
        })
      );

      //send the response
      res.json(modSpieces);
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
