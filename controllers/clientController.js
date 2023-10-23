const db = require("../models/index");
const Client = db.models.Client;
const _ = require("lodash");

module.export = {
  add: async (req, res) => {
    try {
      const _feilds = _.pick(req.body, ["name", "phoneNum", "account", "date"]);

      if (_feilds.length < 3) return res.status(400).json("enter all feilds");

      //check if client exist
      let client = await Client.findOne({
        where: { phoneNum: _feilds.phoneNum },
      });
      if (client) return res.status(400).json("client exist");

      //add new clients
      await Client.create(_feilds);

      res.json("success");
    } catch (error) {
      if (error) throw error;
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
      const _feilds = _.pick(req.body, ["id", "type", "amount"]);

      if (_feilds.length < 2) return res.status(400).json("enter all feilds");

      //check type
      let client = await client.findOne({ where: { id: _feilds.id } });
      if (_feilds.type === "add") {
        await Client.update(
          {
            account: client.account + parseInt(_feilds.amount),
          },
          { where: { id: _feilds.id } }
        );
      } else {
        await Client.update(
          {
            account: client.account - parseInt(_feilds.amount),
          },
          { where: { id: _feilds.id } }
        );
      }

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
  deleteClient: async (req, res) => {
    try {
      if (!req.body) return res.status(400).json("enter all feilds");

      req.body.map(async (id) => {
        await Client.destroy({ where: { id } });
      });

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },
};
