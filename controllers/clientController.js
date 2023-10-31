const db = require("../models/index");
const Client = db.models.Client;
const Bill = db.models.Bill;
const _ = require("lodash");

module.exports = {
  add: async (req, res) => {
    try {
      const _feilds = _.pick(req.body, ["name", "phoneNum", "account"]);

      if (_feilds.length < 2) return res.status(400).json("enter all feilds");

      //check if client exist
      let client = await Client.findOne({
        where: { name: _feilds.name },
      });
      if (client) return res.status(400).json("client exist");

      //add new clients
      await Client.create(_feilds);

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  getAll: async (req, res) => {
    try {
      let clients = await Client.findAll({ order: [["account", "DESC"]] });

      //send request
      res.json(clients);
    } catch (error) {
      throw error;
    }
  },
  getOne: async (req, res) => {
    try {
      let { id } = req.body;

      //find the bill
      let clients = await Client.findOne({
        where: { id },
        include: Bill,
      });

      //send the bill
      res.json(clients);
    } catch (error) {
      throw error;
    }
  },
  findOne: async (req, res) => {
    try {
      let { name } = req.body;

      //find the bill
      let clients = await Client.findAll({
        where: { name },
      });

      //send the bill
      res.json(clients);
    } catch (error) {
      throw error;
    }
  },
  update: async (req, res) => {
    try {
      const _feilds = _.pick(req.body, [
        "id",
        "name",
        "phoneNum",
        "account",
        "date",
      ]);

      if (_feilds.length < 4) return res.status(400).json("enter all feilds");

      //add new clients
      await Client.update(_feilds, { where: { id: _feilds.id } });

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  modify: async (req, res) => {
    try {
      const _feilds = _.pick(req.body, ["name", "type", "amount"]);

      if (_feilds.length < 2) return res.status(400).json("enter all feilds");

      //check type
      let client = await Client.findOne({ where: { name: _feilds.name } });
      if (_feilds.type === "اضافة") {
        await Client.update(
          {
            account: client.account + parseInt(_feilds.amount),
          },
          { where: { id: client.id } }
        );
      } else {
        await Client.update(
          {
            account: client.account - parseInt(_feilds.amount),
          },
          { where: { id: client.id } }
        );
      }

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  deleteClient: async (req, res) => {
    try {
      const { id } = req.body;

      if (!id) return res.status(400).json("enter all feilds");
      //deleteClient
      await Client.destroy({ where: { id } });
      //deleteBills

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
};
