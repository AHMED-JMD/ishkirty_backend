const { getSum } = require("../middlewares/getSum");
const db = require("../models/index");
const Bill = db.models.Bill;
const Spieces = db.models.Spieces;
const BillTrans = db.models.BillTrans;
const Admin = db.models.Admin;
const { Op } = require("sequelize");
const { sequelize } = db;
const { requireBusinessLocation } = require("../middlewares/businessLocation");

module.exports = {
  totalSales: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { start_date, end_date, admin_id } = req.body;

      if (!(start_date && end_date && admin_id))
        return res.status(400).json("invalid request body");

      //bill for by admin role
      let admin = await Admin.findOne({ where: { admin_id } });
      if (!admin) {
        return res.status(400).json("المسؤول غير موجود");
      }
      // fetch bills and aggregate payment amounts by method + shiftTime
      let bills;

      if (admin.role !== "admin" && admin.role !== "super admin") {
        bills = await Bill.findAll({
          where: {
            date: { [Op.between]: [start_date, end_date] },
            AdminAdminId: admin_id,
            isDeleted: false,
            business_location,
          },
        });
      } else {
        bills = await Bill.findAll({
          where: {
            date: { [Op.between]: [start_date, end_date] },
            isDeleted: false,
            business_location,
          },
        });
      }

      const lookup = {}; // key: method__shift -> sum

      for (const b of bills) {
        const shift = b.shiftTime;

        if (b.paymentMethods) {
          //convert stringified JSON to object
          convertdPM = JSON.parse(b.paymentMethods);

          for (const pm of convertdPM) {
            const method = pm["method"];
            const amt = parseFloat(pm["amount"]) || 0;
            const key = `${method}__${shift}`;
            lookup[key] = (lookup[key] || 0) + amt;
          }
        } else {
          const method = b.paymentMethod;
          const amt = parseFloat(b.amount) || 0;
          const key = `${method}__${shift}`;
          lookup[key] = (lookup[key] || 0) + amt;
        }
      }

      // then compute values (include فوري)
      const cashMor = lookup["كاش__صباحية"] || 0;
      const bankMor = lookup["بنكك__صباحية"] || 0;
      const accountMor = lookup["حساب__صباحية"] || 0;
      const fawryMor = lookup["فوري__صباحية"] || 0;

      const cashEv = lookup["كاش__مسائية"] || 0;
      const bankEv = lookup["بنكك__مسائية"] || 0;
      const accountEv = lookup["حساب__مسائية"] || 0;
      const fawryEv = lookup["فوري__مسائية"] || 0;

      //send request
      res.json({
        totalCash: cashMor + cashEv,
        totalBank: bankMor + bankEv,
        totalFawry: fawryMor + fawryEv,
        totalAcc: accountMor + accountEv,
      });
    } catch (error) {
      throw error;
    }
  },

  totalSalesCosts: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

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
          business_location,
        },
        include: [
          {
            model: Spieces,
            attributes: ["id", "name", "spice_cost"], // Include species details
            where: { business_location },
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
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { name, curr_date, week_date, month_date } = req.body;

      if (!(name && week_date && month_date && curr_date))
        return res.status(400).json("invalid request body");

      //#todays sales
      let today_sales = await BillTrans.findAll({
        where: { name, date: curr_date, business_location },
      });
      //#weeks sales
      let week_sales = await BillTrans.findAll({
        where: {
          name,
          date: { [Op.between]: [week_date, curr_date] },
          business_location,
        },
      });
      //#months sales
      let month_sales = await BillTrans.findAll({
        where: {
          name,
          date: { [Op.between]: [month_date, curr_date] },
          business_location,
        },
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
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { start_date, end_date, admin_id } = req.body;

      if (!(start_date && end_date && admin_id))
        return res.status(400).json("invalid request body");

      //check admin
      let admin = await db.models.Admin.findOne({ where: { admin_id } });
      if (!admin) {
        return res.status(400).json("المسؤول غير موجود");
      }

      //get all spices
      const spieces = await Spieces.findAll({
        where: { business_location },
        order: [["price", "DESC"]],
      });

      //get the sum of each spice sales
      const modSpieces = await Promise.all(
        spieces.map(async (spice) => {
          //get all bill trans of a spice
          const bills = await BillTrans.findAll({
            where: {
              SpieceId: spice.id,
              date: { [Op.between]: [start_date, end_date] },
              business_location,
            },
            include: [
              {
                model: Bill,
                where: {
                  isDeleted: false,
                  business_location,
                  ...(admin.role !== "admin" ? { AdminAdminId: admin_id } : {}),
                },
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
            const cost = Number(spice.spice_cost) || 0;
            return acc + qty * cost;
          }, 0);

          return {
            id: spice.id,
            name: spice.name,
            category: spice.category,
            tot_sales: sales.revenue,
            sum_quantity: sales.sum,
            price: spice.price,
            spice_cost: spice.spice_cost,
            tot_costs: tot_costs,
            ImgLink: spice.ImgLink,
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
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { name, start_date, end_date } = req.body;

      if (!(name && start_date && end_date))
        return res.status(400).json("invalid request body");

      //get bill trans of spices by date and name
      //#searched sales
      let searchedSales = await BillTrans.findAll({
        where: {
          name,
          date: { [Op.between]: [start_date, end_date] },
          business_location,
        },
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
