const db = require("../models/index");
const Store = db.models.Store;
const Spieces = db.models.Spieces;
const SpiceStore = db.models.SpiceStore;
const sequelize = db.sequelize;

module.exports = {
  addnew: async (req, res) => {
    try {
      const { name, quantity, sell_price, buy_price } = req.body;

      if (!name) return res.status(400).json("enter all feilds");

      // check if store item exists
      let item = await Store.findOne({ where: { name } });
      if (item) return res.status(400).json("store item exist");

      await Store.create({
        name,
        quantity: quantity ? Number(quantity) : 0,
        sell_price: sell_price ? Number(sell_price) : 0,
        buy_price: buy_price ? Number(buy_price) : 0,
      });

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },

  getall: async (req, res) => {
    try {
      let items = await Store.findAll({ order: [["quantity", "DESC"]] });
      res.json(items);
    } catch (error) {
      throw error;
    }
  },

  searched: async (req, res) => {
    try {
      let { name } = req.body;
      if (!name) return res.status(400).json("enter all feilds");

      let items = await Store.findAll({ where: { name } });
      res.json(items);
    } catch (error) {
      throw error;
    }
  },

  // attach a store item to a spice with the required quantity per spice unit
  // accepts: { spiceId?, spiceName?, storeId?, storeName?, quantityNeeded }
  addStoreSpices: async (req, res) => {
    try {
      const { spiceId, spiceName, storeId, storeName, quantityNeeded } =
        req.body;

      if (
        (!spiceId && !spiceName) ||
        (!storeId && !storeName) ||
        quantityNeeded === undefined
      )
        return res.status(400).json("enter all feilds");

      // resolve spice
      let spice;
      if (spiceId) spice = await Spieces.findByPk(spiceId);
      else spice = await Spieces.findOne({ where: { name: spiceName } });

      console.log("Resolved spice:", spice);

      if (!spice) return res.status(400).json("spice not found");

      // resolve store item
      let store;
      if (storeId) store = await Store.findByPk(storeId);
      else store = await Store.findOne({ where: { name: storeName } });

      if (!store) return res.status(400).json("store item not found");

      //create new association
      await SpiceStore.create({
        SpieceId: spice.id,
        StoreId: store.id,
        quantityNeeded: Number(quantityNeeded),
      });

      res.json({ success: true, spiceId: spice.id, storeId: store.id });
    } catch (error) {
      throw error;
    }
  },
};
