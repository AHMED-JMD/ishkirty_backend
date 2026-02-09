const db = require("../models/index");
const Client = db.models.Client;
const Bill = db.models.Bill;
const _ = require("lodash");
const { requireBusinessLocation } = require("../middlewares/businessLocation");

module.exports = {
  add: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const _feilds = _.pick(req.body, ["name", "phoneNum", "account"]);

      if (_feilds.length < 2) return res.status(400).json("enter all feilds");

      //check if client exist
      let client = await Client.findOne({
        where: { name: _feilds.name, business_location },
      });
      if (client) return res.status(400).json("client exist");

      //add new clients
      await Client.create({ ..._feilds, business_location });

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  getAll: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      let clients = await Client.findAll({
        where: { business_location },
        order: [["account", "DESC"]],
      });

      //send request
      res.json(clients);
    } catch (error) {
      throw error;
    }
  },
  getOne: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      let { id } = req.body;

      //find the bill
      let clients = await Client.findOne({
        where: { id, business_location },
        include: [
          {
            model: Bill,
            where: { business_location },
            required: false,
          },
        ],
      });

      //send the bill
      res.json(clients);
    } catch (error) {
      throw error;
    }
  },
  findOne: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      let { name } = req.body;

      //find the bill
      let clients = await Client.findAll({
        where: { name, business_location },
      });

      //send the bill
      res.json(clients);
    } catch (error) {
      throw error;
    }
  },
  update: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const _feilds = _.pick(req.body, [
        "id",
        "name",
        "phoneNum",
        "account",
        "date",
      ]);

      if (_feilds.length < 4) return res.status(400).json("enter all feilds");

      //add new clients
      await Client.update(_feilds, {
        where: { id: _feilds.id, business_location },
      });

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  modify: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const _feilds = _.pick(req.body, ["name", "type", "amount"]);

      if (_feilds.length < 2) return res.status(400).json("enter all feilds");

      //check type
      let client = await Client.findOne({
        where: { name: _feilds.name, business_location },
      });
      if (!client) return res.status(400).json("client not found");
      if (_feilds.type === "اضافة") {
        await Client.update(
          {
            account: client.account + parseInt(_feilds.amount),
          },
          { where: { id: client.id, business_location } },
        );
      } else {
        await Client.update(
          {
            account: client.account - parseInt(_feilds.amount),
          },
          { where: { id: client.id, business_location } },
        );
      }

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  deleteClient: async (req, res) => {
    try {
      const business_location = requireBusinessLocation(req, res);
      if (!business_location) return;

      const { id } = req.body;

      if (!id) return res.status(400).json("enter all feilds");
      //deleteClient
      await Client.destroy({ where: { id, business_location } });
      //deleteBills

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
};
