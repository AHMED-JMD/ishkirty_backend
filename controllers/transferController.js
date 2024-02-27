const db = require("../models/index");
const Transfer = db.models.Transfer;
const _ = require("lodash");

module.exports = {
  add: async (req, res) => {
    try {
      const _feilds = _.pick(req.body, ["date", "amount", "AdminAdminId"]);

      if (!_feilds) return res.status(400).json("enter all feilds");

      //check if client exist
      let transfer = await Transfer.findOne({
        where: { date: _feilds.date, AdminAdminId: _feilds.AdminAdminId },
      });
      if (transfer) {
        //update
        await Transfer.update(
          { amount: transfer.amount + parseInt(_feilds.amount) },
          { where: { date: _feilds.date, AdminAdminId: _feilds.AdminAdminId } }
        );
      } else {
        //add new clients
        await Transfer.create(_feilds);
      }

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  get: async (req, res) => {
    try {
      let { date, adminId } = req.body;

      //find the bill
      let transfer = await Transfer.findOne({
        where: { date, AdminAdminId: adminId },
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
