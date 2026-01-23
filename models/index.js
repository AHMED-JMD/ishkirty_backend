require("dotenv").config();
const Sequelize = require("sequelize");

//connecting to mysql
const sequelize = new Sequelize(
  process.env.DBNAME,
  process.env.DBUSER,
  process.env.DBPASSWORD,
  {
    host: process.env.DBHOST,
    dialect: process.env.DIALECT,
  },
);

//initializing db object holding db_connection && db_models
let db = {};
db.sequelize = sequelize;
db.models = {};
//require the objects
let Admin = require("./admin")(sequelize, Sequelize.DataTypes);
let Client = require("./client")(sequelize, Sequelize.DataTypes);
let Spieces = require("./spieces")(sequelize, Sequelize.DataTypes);
let Bill = require("./bill")(sequelize, Sequelize.DataTypes);
let BillTrans = require("./billTrans")(sequelize, Sequelize.DataTypes);
let Transfer = require("./transfer")(sequelize, Sequelize.DataTypes);
let Store = require("./store")(sequelize, Sequelize.DataTypes);
let SpiceStore = require("./spiceStore")(sequelize, Sequelize.DataTypes);
let PurchaseRequest = require("./purchaseRequest")(
  sequelize,
  Sequelize.DataTypes,
);
let Employee = require("./employee")(sequelize, Sequelize.DataTypes);
let EmpTrans = require("./empTrans")(sequelize, Sequelize.DataTypes);
let Discharges = require("./discharges")(sequelize, Sequelize.DataTypes);
let Daily = require("./daily")(sequelize, Sequelize.DataTypes);
let Safe = require("./safe")(sequelize, Sequelize.DataTypes);
let SafeDailies = require("./safeDailies")(sequelize, Sequelize.DataTypes);
let SafeTransfers = require("./safeTransfers")(sequelize, Sequelize.DataTypes);

//sql relationship here -------------------------------
Bill.hasMany(BillTrans);
BillTrans.belongsTo(Bill);

Spieces.hasMany(BillTrans);
BillTrans.belongsTo(Spieces);

Client.hasMany(Bill);
Bill.belongsTo(Client);

Admin.hasMany(Bill);
Bill.belongsTo(Admin);

Admin.hasMany(Transfer);
Transfer.belongsTo(Admin);

// //-----------------------------------------------------
// store associations
// a Spice can require many Store items and a Store item can be used by many Spieces
Spieces.belongsToMany(Store, { through: SpiceStore });
Store.belongsToMany(Spieces, { through: SpiceStore });

// allow eager-loading from the through model
SpiceStore.belongsTo(Store, { foreignKey: "StoreId" });
SpiceStore.belongsTo(Spieces, { foreignKey: "SpieceId" });

// employee relations
Employee.hasMany(EmpTrans);
EmpTrans.belongsTo(Employee);

// purchase requests relation
PurchaseRequest.belongsTo(Store, { foreignKey: "StoreId" });
Store.hasMany(PurchaseRequest, { foreignKey: "StoreId" });

// daily relations
Daily.hasMany(Bill);
Bill.belongsTo(Daily, { foreignKey: "DailyId" });

Daily.hasMany(EmpTrans);
EmpTrans.belongsTo(Daily, { foreignKey: "DailyId" });

Daily.hasMany(PurchaseRequest);
PurchaseRequest.belongsTo(Daily, { foreignKey: "DailyId" });

Daily.hasMany(Discharges);
Discharges.belongsTo(Daily, { foreignKey: "DailyId" });

// Safe relations
Safe.hasMany(Daily, { foreignKey: "safeId", as: "dailys" });
Safe.hasMany(Bill, { foreignKey: "safeId", as: "bills" });
Bill.belongsTo(Safe, { foreignKey: "safeId", as: "safe" });
Safe.hasMany(SafeDailies, { foreignKey: "SafeId", as: "safeDailies" });
Safe.hasMany(SafeTransfers, { foreignKey: "SafeId", as: "safeTransfers" });
SafeDailies.belongsTo(Safe, { foreignKey: "SafeId", as: "safe" });
SafeTransfers.belongsTo(Safe, { foreignKey: "SafeId", as: "safe" });

// //add to db models
db.models.Admin = Admin;
db.models.Client = Client;
db.models.Spieces = Spieces;
db.models.Bill = Bill;
db.models.BillTrans = BillTrans;
db.models.Transfer = Transfer;
db.models.Store = Store;
db.models.SpiceStore = SpiceStore;
db.models.PurchaseRequest = PurchaseRequest;
db.models.Employee = Employee;
db.models.EmpTrans = EmpTrans;
db.models.Discharges = Discharges;
db.models.Daily = Daily;
db.models.Safe = Safe;
db.models.SafeDailies = SafeDailies;
db.models.SafeTransfers = SafeTransfers;

module.exports = db;
