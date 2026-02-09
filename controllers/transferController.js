const db = require("../models/index");
const Transfer = db.models.Transfer;
const _ = require("lodash");
const { requireBusinessLocation } = require("../middlewares/businessLocation");

module.exports = {
  add: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const _feilds = _.pick(req.body, ["date", "amount", "AdminAdminId"]);

      if (!_feilds) return res.status(400).json("enter all feilds");

      //check if client exist
      let transfer = await Transfer.findOne({
        where: {
          date: _feilds.date,
          AdminAdminId: _feilds.AdminAdminId,
          business_location,
        },
      });
      if (transfer) {
        //update
        await Transfer.update(
          { amount: transfer.amount + parseInt(_feilds.amount) },
          {
            where: {
              date: _feilds.date,
              AdminAdminId: _feilds.AdminAdminId,
              business_location,
            },
          },
        );
      } else {
        //add new clients
        await Transfer.create({ ..._feilds, business_location });
      }

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  get: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      let { date, adminId } = req.body;

      //find the bill
      let transfer = await Transfer.findOne({
        where: { date, AdminAdminId: adminId, business_location },
      });

      //send the bill
      let amount = 0;
      if (transfer) {
        amount = transfer.amount;
        //res
        res.json(amount);
      } else {
        //res
        res.json(amount);
      }
    } catch (error) {
      throw error;
    }
  },
  modify: async (req, res) => {
    try {
    } catch (error) {
      if (error) throw error;
    }
  },
  deleteTransfer: async (req, res) => {
    try {
    } catch (error) {
      if (error) throw error;
    }
  },
};
