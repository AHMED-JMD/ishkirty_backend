const db = require("../models/index");
const Store = db.models.Store;
const Spieces = db.models.Spieces;
const SpiceStore = db.models.SpiceStore;
const sequelize = db.sequelize;
const PurchaseRequest = db.models.PurchaseRequest;
const { Op } = require("sequelize");

module.exports = {
  addnew: async (req, res) => {
    try {
      const { name, quantity, sell_price, buy_price, isKilo } = req.body;

      if (!name) return res.status(400).json("enter all feilds");

      // check if store item exists
      let item = await Store.findOne({ where: { name } });
      if (item) return res.status(400).json("store item exist");

      await Store.create({
        name,
        quantity: quantity ? Number(quantity) : 0,
        sell_price: sell_price ? Number(sell_price) : 0,
        buy_price: buy_price ? Number(buy_price) : 0,
        isKilo: isKilo ? Boolean(isKilo) : false,
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
      const { spiceId, storeId, quantityNeeded } = req.body;

      if (!spiceId || !storeId || quantityNeeded === undefined)
        return res.status(400).json("enter all feilds");

      // resolve spice
      let spice = await Spieces.findByPk(spiceId);

      if (!spice) return res.status(400).json("spice not found");

      // resolve store item
      let store = await Store.findByPk(storeId);

      if (!store) return res.status(400).json("store item not found");

      // create or update association: if exists update quantityNeeded, else create
      const existing = await SpiceStore.findOne({
        where: { SpieceId: spice.id, StoreId: store.id },
      });
      console.log(existing);

      if (existing) {
        //update quantityNeeded
        await existing.update({ quantityNeeded: Number(quantityNeeded) });
        return res.json({
          success: true,
          updated: true,
          spiceId: spice.id,
          storeId: store.id,
        });
      }

      //create new association
      await SpiceStore.create({
        SpieceId: spice.id,
        StoreId: store.id,
        quantityNeeded: Number(quantityNeeded),
      });

      res.json({
        success: true,
        created: true,
        spiceId: spice.id,
        storeId: store.id,
      });
    } catch (error) {
      throw error;
    }
  },

  getStoreSpice: async (req, res) => {
    try {
      const { id } = req.body;

      if (!id) return res.status(400).json("enter spice id");

      // SpiceStore holds the quantityNeeded and references Store via StoreId
      const associations = await SpiceStore.findAll({
        where: { SpieceId: id },
        include: [{ model: Store }],
      });

      const list = associations.map((a) => ({
        store_id: a.Store ? a.Store.id : null,
        spice_id: a.SpieceId,
        store_name: a.Store ? a.Store.name : null,
        quantity_needed: a.quantityNeeded,
        isKilo: a.Store ? a.Store.isKilo : null,
      }));

      res.json(list);
    } catch (error) {
      throw error;
    }
  },

  // Create a purchase request and increase store item quantity
  // accepts: { store_item, vendor, quantity, buy_price?, date? }
  createPurchase: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { store_item, vendor, quantity, buy_price, date } = req.body;

      if (!store_item || !vendor || quantity === undefined)
        return res.status(400).json("enter all feilds");

      const store = await Store.findByPk(store_item, { transaction: t });
      if (!store) {
        await t.rollback();
        return res.status(400).json("store item not found");
      }

      const usedPrice =
        buy_price !== undefined
          ? Number(buy_price)
          : Number(store.buy_price || 0);
      const qty = Number(quantity);

      const purchase = await PurchaseRequest.create(
        {
          StoreId: store.id,
          vendor,
          quantity: qty,
          buy_price: usedPrice,
          date: date ? new Date(date) : new Date(),
        },
        { transaction: t }
      );

      await store.update(
        { quantity: Number(store.quantity) + qty },
        { transaction: t }
      );

      await t.commit();
      res.json({ success: true, purchase });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  // get all purchases
  getPurchases: async (req, res) => {
    try {
      const purchases = await PurchaseRequest.findAll({
        // include: [{ model: Store }],
        order: [["date", "DESC"]],
      });
      res.json(purchases);
    } catch (error) {
      throw error;
    }
  },

  // delete a purchase and reduce the store quantity accordingly
  deletePurchase: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json("enter id");

      const purchase = await PurchaseRequest.findByPk(id, { transaction: t });
      if (!purchase) {
        await t.rollback();
        return res.status(400).json("purchase not found");
      }

      const store = await Store.findByPk(purchase.StoreId, { transaction: t });
      if (store) {
        const newQty = Number(store.quantity) - Number(purchase.quantity);
        await store.update(
          { quantity: newQty < 0 ? 0 : newQty },
          { transaction: t }
        );
      }

      await purchase.destroy({ transaction: t });
      await t.commit();

      res.json({ success: true });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },

  // delete an association between a store item and a spice
  // accepts: { storeId, spiceId }
  deleteStoreSpice: async (req, res) => {
    try {
      const { storeId, spiceId } = req.body;

      if (!storeId || !spiceId) return res.status(400).json("enter all feilds");

      const association = await SpiceStore.findOne({
        where: { StoreId: storeId, SpieceId: spiceId },
      });

      if (!association) return res.status(400).json("association not found");

      await association.destroy();

      res.json({ success: true, storeId, spiceId });
    } catch (error) {
      throw error;
    }
  },

  update: async (req, res) => {
    try {
      const { id, name, quantity, sell_price, buy_price } = req.body;

      if (!id) return res.status(400).json("enter id");

      const item = await Store.findByPk(id);
      if (!item) return res.status(400).json("store item not found");

      if (name && name !== item.name) {
        const exists = await Store.findOne({ where: { name } });
        if (exists) return res.status(400).json("store item exist");
      }

      await item.update({
        name: name !== undefined ? name : item.name,
        quantity: quantity !== undefined ? Number(quantity) : item.quantity,
        sell_price:
          sell_price !== undefined ? Number(sell_price) : item.sell_price,
        buy_price: buy_price !== undefined ? Number(buy_price) : item.buy_price,
      });

      res.json("success");
    } catch (error) {
      throw error;
    }
  },

  deleteStore: async (req, res) => {
    try {
      const { id } = req.body;

      if (!id) return res.status(400).json("enter id");

      const item = await Store.findByPk(id);
      if (!item) return res.status(400).json("store item not found");

      // remove any associations in SpiceStore first
      await SpiceStore.destroy({ where: { StoreId: item.id } });

      await item.destroy();

      res.json("success");
    } catch (error) {
      throw error;
    }
  },
};
