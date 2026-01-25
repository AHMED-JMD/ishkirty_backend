const { getSum } = require("../middlewares/getSum");
const db = require("../models/index");
const Bill = db.models.Bill;
const Spieces = db.models.Spieces;
const BillTrans = db.models.BillTrans;
const { Op } = require("sequelize");
const { sequelize } = db;

module.exports = {
  totalSales: async (req, res) => {
    try {
      const { start_date, end_date } = req.body;

      //query to get sum of sales grouped by payment method and shift time
      const rows = await Bill.findAll({
        attributes: [
          "paymentMethod",
          "shiftTime",
          [sequelize.fn("SUM", sequelize.col("amount")), "sumAmount"],
        ],
        where: {
          date: { [Op.between]: [start_date, end_date] },
          isDeleted: false,
        },
        group: ["paymentMethod", "shiftTime"],
        raw: true,
      });

      // turn rows into a lookup
      const lookup = {};
      rows.forEach((r) => {
        const key = `${r.paymentMethod}__${r.shiftTime}`;
        lookup[key] = Number(r.sumAmount) || 0;
      });

      // then compute values
      const cashMor = lookup["كاش__صباحية"] || 0;
      const bankMor = lookup["بنكك__صباحية"] || 0;
      const accountMor = lookup["حساب__صباحية"] || 0;
      const totalMor = cashMor + bankMor + accountMor;

      const cashEv = lookup["كاش__مسائية"] || 0;
      const bankEv = lookup["بنكك__مسائية"] || 0;
      const accountEv = lookup["حساب__مسائية"] || 0;
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

  totalSalesCosts: async (req, res) => {
    try {
      const { startDate, endDate } = req.body;

      // Validate required parameters
      if (!startDate || !endDate) {
        return res.status(400).json("startDate and endDate are required");
      }

      // Query bill transactions within the date range
      const billTrans = await BillTrans.findAll({
        where: {
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: [
          {
            model: Spieces,
            attributes: ["id", "name", "spice_cost"], // Include species details
            required: true, // Only include bill transactions with valid species
          },
        ],
        order: [["createdAt", "ASC"]],
      });

      // Calculate total costs and format response
      let totalCosts = 0;
      billTrans.forEach((bill) => {
        if (bill.Spiece !== undefined) {
          totalCosts += bill.Spiece.spice_cost * bill.quantity;
        }
      });

      // Calculate grand total across all bill transactions
      // const grandTotal = results.reduce((sum, bill) => sum + bill.totalCost, 0);

      res.json({ totalCosts });
    } catch (error) {
      console.error("Error getting bill transactions:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Failed to retrieve bill transactions",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
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

          // calculate total costs for this spice using spice_cost from the Spieces model
          const tot_costs = bills.reduce((acc, b) => {
            const qty = Number(b.quantity) || 0;
            const cost = Number(type.spice_cost) || 0;
            return acc + qty * cost;
          }, 0);

          return {
            id: type.id,
            name: type.name,
            category: type.category,
            tot_sales: sales.revenue,
            tot_costs,
            ImgLink: type.ImgLink,
          };
        }),
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
        total_searched_sales: total_searched_sales.sum,
      });
    } catch (error) {
      throw error;
    }
  },
};
