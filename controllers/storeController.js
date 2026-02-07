const admin = require("../models/admin");
const db = require("../models/index");
const Admin = db.models.Admin;
const Store = db.models.Store;
const Spieces = db.models.Spieces;
const SpiceStore = db.models.SpiceStore;
const sequelize = db.sequelize;
const PurchaseRequest = db.models.PurchaseRequest;
const { Op } = require("sequelize");

module.exports = {
  addnew: async (req, res) => {
    try {
      const { name, quantity, sell_price, warn_value, type, isKilo, admin_id } =
        req.body;

      if (!name || !type || !admin_id)
        return res.status(400).json("enter all feilds");

      //check admin
      const admin = await Admin.findByPk(admin_id);
      if (!admin || admin.role !== "admin")
        return res.status(400).json("not authorized");

      // check if store item exists
      let item = await Store.findOne({ where: { name } });
      if (item) return res.status(400).json("store item exist");

      await Store.create({
        name,
        quantity: quantity ? Number(quantity) : 0,
        warn_value: warn_value ? Number(warn_value) : 0,
        price: sell_price ? Number(sell_price) : 0,
        type: type !== undefined ? type : "بيع",
        isKilo: isKilo ? Boolean(isKilo) : false,
      });

      res.json("success");
    } catch (error) {
      if (error) throw error;
    }
  },

  getall: async (req, res) => {
    try {
      const { type } = req.body;
      if (!type) return res.status(400).json("الرجاء اختيار نوع المخزن");

      let items = await Store.findAll({
        where: { type },
        order: [["quantity", "DESC"]],
      });

      res.json(items);
    } catch (error) {
      throw error;
    }
  },
  update: async (req, res) => {
    try {
      const { id, name, quantity, sell_price, warn_value, isKilo, admin_id } =
        req.body;

      if (!id || !admin_id) return res.status(400).json("enter ids");

      //check admin---
      const admin = await Admin.findByPk(admin_id);
      if (!admin || admin.role !== "admin")
        return res.status(400).json("not authorized");

      const item = await Store.findByPk(id);
      if (!item) return res.status(400).json("store item not found");

      if (name && name !== item.name) {
        const exists = await Store.findOne({ where: { name } });
        if (exists) return res.status(400).json("store item exist");
      }

      const oldPrice = Number(item.price || 0);
      const oldIsKilo = Boolean(item.isKilo);

      const newPrice = sell_price !== undefined ? Number(sell_price) : oldPrice;
      const newIsKilo = isKilo !== undefined ? Boolean(isKilo) : oldIsKilo;

      // if price, isKilo interpretation, or type changed, update spice_cost for linked spices
      if (newPrice !== oldPrice || newIsKilo !== oldIsKilo) {
        const oldUnit = oldIsKilo ? oldPrice / 1000 : oldPrice;
        const newUnit = newIsKilo ? newPrice / 1000 : newPrice;
        const diffUnit = newUnit - oldUnit;

        if (diffUnit !== 0) {
          //find all SpiceStore associations for this store item
          const associations = await SpiceStore.findAll({
            where: { StoreId: item.id },
          });
          for (const assoc of associations) {
            //check quantityNeeded !=0
            const qtyNeeded = Number(assoc.quantityNeeded || 0);
            if (qtyNeeded === 0) continue;

            //find the spice
            const spice = await Spieces.findByPk(assoc.SpieceId);
            if (!spice) continue;

            const costChange = qtyNeeded * diffUnit;
            if (costChange !== 0) {
              await spice.update({
                spice_cost: Number(spice.spice_cost || 0) + costChange,
              });
            }
          }
        }
      }

      // finally update the store item
      await item.update({
        name: name !== undefined ? name : item.name,
        quantity: quantity !== undefined ? Number(quantity) : item.quantity,
        warn_value:
          warn_value !== undefined ? Number(warn_value) : item.warn_value,
        price: newPrice,
        isKilo: newIsKilo,
      });

      res.json("success");
    } catch (error) {
      throw error;
    }
  },

  deleteStore: async (req, res) => {
    try {
      const { id, admin_id } = req.body;

      if (!id || !admin_id) return res.status(400).json("enter ids");

      //check admin---
      const admin = await Admin.findByPk(admin_id);
      if (!admin || admin.role !== "admin")
        return res.status(400).json("not authorized");

      const item = await Store.findByPk(id);
      if (!item) return res.status(400).json("store item not found");

      //updating Spice cost
      const associations = await SpiceStore.findAll({
        where: { StoreId: item.id },
      });
      //getting association
      if (associations.length !== 0) {
        for (const assoc of associations) {
          //check quantityNeeded !=0
          const qtyNeeded = Number(assoc.quantityNeeded || 0);
          if (qtyNeeded === 0) continue;

          //find the spice
          const spice = await Spieces.findByPk(assoc.SpieceId);
          if (!spice) continue;

          const costChange = qtyNeeded * item.price;
          if (costChange !== 0) {
            await spice.update({
              spice_cost: Number(spice.spice_cost || 0) + costChange,
            });
          }
        }
      }

      // remove any associations in SpiceStore first
      await SpiceStore.destroy({ where: { StoreId: item.id } });

      //remove item
      await item.destroy();

      res.json("success");
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

  // attach a store item to a spice with the required quantity per spice unit accepts: { spiceId, storeId?, quantityNeeded }
  addStoreSpices: async (req, res) => {
    try {
      const { spiceId, storeId, quantityNeeded, store_type } = req.body;

      if (!spiceId || !storeId || quantityNeeded === undefined || !store_type)
        return res.status(400).json("enter all feilds");

      // resolve spice
      let spice = await Spieces.findByPk(spiceId);

      if (!spice) return res.status(400).json("spice not found");

      // resolve store item
      let store = await Store.findByPk(storeId);

      if (!store) return res.status(400).json("store item not found");
      //check store type
      if (store.type !== store_type)
        return res.status(400).json("store type mismatch");

      // create or update association: if exists update quantityNeeded, else create
      const existing = await SpiceStore.findOne({
        where: { SpieceId: spice.id, StoreId: store.id },
      });

      if (existing) {
        // compute difference and update spice_cost accordingly
        if (store_type === "تصنيع") {
          const newQ = Number(quantityNeeded);
          const oldQ = Number(existing.quantityNeeded || 0);

          //the amount that quantityNeeded changed
          const diff = newQ - oldQ;
          const unitPrice = store.isKilo
            ? Number(store.price) / 1000
            : Number(store.price);
          const costChange = diff * unitPrice;

          //update spice cost
          if (costChange !== 0) {
            await spice.update({
              spice_cost: Number(spice.spice_cost || 0) + costChange,
            });
          }
        }

        // update quantityNeeded
        await existing.update({ quantityNeeded, store_type });

        return res.json({
          success: true,
          updated: true,
          spiceId: spice.id,
          storeId: store.id,
        });
      }

      // create new association and add cost for the required quantity
      if (store_type === "تصنيع") {
        const q = Number(quantityNeeded);
        const unitPrice = store.isKilo
          ? Number(store.price) / 1000
          : Number(store.price);
        const addCost = q * unitPrice;

        //update spice cost
        if (addCost !== 0) {
          await spice.update({
            spice_cost: Number(spice.spice_cost || 0) + addCost,
          });
        }
      }

      await SpiceStore.create({
        SpieceId: spice.id,
        StoreId: store.id,
        quantityNeeded,
        store_type,
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

  // Create a purchase request and increase store item quantity
  // accepts: { store_item, vendor, quantity, buy_price?, date? }
  createPurchase: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const {
        store_item,
        vendor,
        quantity,
        net_quantity,
        payment_method,
        date,
        type,
        tran_type,
        admin_id,
      } = req.body;

      if (
        !store_item ||
        !date ||
        quantity === undefined ||
        !net_quantity ||
        !payment_method ||
        !admin_id ||
        !tran_type
      )
        return res.status(400).json("enter all feilds");

      //check admin
      let admin = await Admin.findByPk(admin_id);
      if (!admin) return res.status(400).json("admin not found");

      const store = await Store.findByPk(store_item, { transaction: t });
      if (!store) {
        await t.rollback();
        return res.status(400).json("store item not found");
      }

      const usedPrice = Number(store.price || 0);
      const qty = Number(quantity);

      const purchase = await PurchaseRequest.create(
        {
          StoreId: store.id,
          vendor,
          quantity: qty,
          net_quantity: Number(net_quantity),
          payment_method: payment_method,
          buy_price: usedPrice,
          date: date,
          store_type: type !== undefined ? type : "بيع",
          type: tran_type !== undefined ? tran_type : "اضافة",
          admin: admin.username,
          AdminAdminId: admin_id,
        },
        { transaction: t },
      );

      //update store quantity based on purchase type
      if (purchase.type === "اضافة") {
        await store.update(
          { quantity: Number(store.quantity) + Number(net_quantity) },
          { transaction: t },
        );
      } else if (purchase.type === "خصم") {
        const newQty = Number(store.quantity) - Number(net_quantity);
        await store.update(
          { quantity: newQty < 0 ? 0 : newQty },
          { transaction: t },
        );
      }

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
        include: [{ model: Store }],
        order: [["date", "DESC"]],
      });

      res.json(purchases);
    } catch (error) {
      throw error;
    }
  },

  // get all purchases
  //TODO: GET BY ADMIN ID
  getPurchasesByDate: async (req, res) => {
    try {
      const { startDate, endDate, type, admin_id } = req.body;
      if (!startDate || !endDate || !type)
        return res.status(400).json("enter startDate and endDate and type");

      let purchases;

      //if admin_id provided,
      //  filter by admin_id,
      //  else return for all admins
      if (admin_id) {
        //check admin
        let admin = await Admin.findByPk(admin_id);
        if (!admin) return res.status(400).json("admin not found");

        purchases = await PurchaseRequest.findAll({
          where: {
            date: {
              [Op.between]: [startDate, endDate],
            },
            store_type: type !== undefined ? type : "بيع",
            AdminAdminId: admin.role !== "admin" ? admin_id : { [Op.ne]: null },
          },
          include: [{ model: Store }],
          order: [["date", "DESC"]],
        });
      } else {
        purchases = await PurchaseRequest.findAll({
          where: {
            date: {
              [Op.between]: [startDate, endDate],
            },
            store_type: type !== undefined ? type : "بيع",
          },
          include: [{ model: Store }],
          order: [["date", "DESC"]],
        });
      }

      res.json(purchases);
    } catch (error) {
      throw error;
    }
  },

  // delete a purchase and reduce the store quantity accordingly
  deletePurchase: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id, admin_id } = req.body;
      if (!id || !admin_id)
        return res.status(400).json("enter id and admin_id");

      //check admin---
      const admin = await Admin.findByPk(admin_id);
      if (!admin || admin.role !== "admin")
        return res.status(400).json("not authorized");

      const purchase = await PurchaseRequest.findByPk(id, { transaction: t });
      if (!purchase) {
        await t.rollback();
        return res.status(400).json("purchase not found");
      }

      //update store value
      const store = await Store.findByPk(purchase.StoreId, { transaction: t });
      if (store) {
        const newQty = Number(store.quantity) - Number(purchase.net_quantity);

        await store.update(
          { quantity: newQty < 0 ? 0 : newQty },
          { transaction: t },
        );
      }

      //delete purchase
      await purchase.destroy({ transaction: t });
      await t.commit();

      res.json({ success: true });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  },
};
