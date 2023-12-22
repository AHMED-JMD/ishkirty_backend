const db = require("../models/index");
const Bill = db.models.Bill;
const BillTrans = db.models.BillTrans;
const Client = db.models.Client;

const { Op } = require("sequelize");

module.exports = {
  add: async (req, res) => {
    try {
      let { date, amount, trans, paymentMethod, shiftTime, clientId } =
        req.body;

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
        ClientId: clientId,
      });

      //add the new bill id to the bill transaction
      trans.map(async (billtran) => {
        //creat new bill trans
        await BillTrans.create({
          name: billtran.spices,
          price: billtran.unit_price,
          quantity: billtran.counter,
          amount: billtran.total_price,
          date,
          BillId: newbill.id,
        });
      });

      //update client id if it is not null
      if (clientId) {
        let client = await Client.findOne({ where: { id: clientId } });

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
      const { isDeleted } = req.body;

      let bills = await Bill.findAll({
        where: { isDeleted: isDeleted },
        order: [["date", "DESC"]],
      });

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
      const { start_date, end_date, isDeleted } = req.body;
      console.log(req.body);
      if (!(start_date && end_date))
        return res.status(400).json("bad request feilds");

      let bills = await Bill.findAll({
        where: { date: { [Op.between]: [start_date, end_date] }, isDeleted },
        order: [["date", "DESC"]],
      });

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
