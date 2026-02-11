require("dotenv").config();
const Sequelize = require("sequelize");
const { connect } = require("..");
const fs = require("fs");

//connecting to mysql
// const useSSL =
//   String(process.env.ONLINE_DBSSL || "false")
//     .toLowerCase()
//     .trim() === "true";

// const sslCAPath = process.env.ONLINE_DB_SSL_CA || null;

// const sslConfig = useSSL
//   ? {
//       rejectUnauthorized: true,
//       ca: sslCAPath ? fs.readFileSync(sslCAPath) : undefined,
//     }
//   : undefined;

const sequelize = new Sequelize(
  process.env.DBNAME,
  process.env.DBUSER,
  process.env.DBPASSWORD,
  {
    host: process.env.DBHOST,
    port: process.env.DBPORT ? Number(process.env.DBPORT) : DBPORT || 3306,
    dialect: process.env.DIALECT,
    dialectOptions: {
      connectTimeout: 60000,
      // ...(sslConfig ? { ssl: sslConfig } : {}),
    },
    logging: console.log, // Enable query logging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: "+00:00",
    retry: { max: 3 },
  },
);

//initializing db object holding db_connection && db_models
let db = {};
db.sequelize = sequelize;
db.models = {};
//require the objects
let Admin = require("./admin")(sequelize, Sequelize.DataTypes);
let BusinessLocation = require("./businessLocation")(
  sequelize,
  Sequelize.DataTypes,
);
let Client = require("./client")(sequelize, Sequelize.DataTypes);
let Spieces = require("./spieces")(sequelize, Sequelize.DataTypes);
let Category = require("./categories")(sequelize, Sequelize.DataTypes);
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

//------------------------- SQL RELATIONS HERE -------------------------------
Bill.hasMany(BillTrans);
BillTrans.belongsTo(Bill);

Client.hasMany(Bill);
Bill.belongsTo(Client);
//----------------------------------------------

// spieces and category relation -------------------------------
Spieces.hasMany(BillTrans);
BillTrans.belongsTo(Spieces);

Category.hasMany(Spieces, { foreignKey: "categoryId" });
Spieces.belongsTo(Category, { foreignKey: "categoryId" });
//---------------------------

//----admin relations ---------------------------
Admin.hasMany(Daily);
Daily.belongsTo(Admin);

Admin.hasMany(SafeDailies);
SafeDailies.belongsTo(Admin);

Admin.hasMany(SafeTransfers);
SafeTransfers.belongsTo(Admin);

Admin.hasMany(Bill);
Bill.belongsTo(Admin);

Admin.hasMany(EmpTrans);
EmpTrans.belongsTo(Admin);

Admin.hasMany(PurchaseRequest);
PurchaseRequest.belongsTo(Admin);

Admin.hasMany(Discharges);
Discharges.belongsTo(Admin);

Admin.hasMany(Transfer);
Transfer.belongsTo(Admin);
//-----------------------------------------------------

//store associations----------------------------------------------------
Spieces.belongsToMany(Store, { through: SpiceStore });
Store.belongsToMany(Spieces, { through: SpiceStore });

SpiceStore.belongsTo(Store, { foreignKey: "StoreId" });
SpiceStore.belongsTo(Spieces, { foreignKey: "SpieceId" });

Store.hasMany(PurchaseRequest, { foreignKey: "StoreId" });
PurchaseRequest.belongsTo(Store, { foreignKey: "StoreId" });
//-----------------------------------------------------------------------
// employee relations
Employee.hasMany(EmpTrans);
EmpTrans.belongsTo(Employee);

// purchase requests relation

// daily relations -----------------------------
Daily.hasMany(Bill);
Bill.belongsTo(Daily, { foreignKey: "DailyId" });

Daily.hasMany(EmpTrans);
EmpTrans.belongsTo(Daily, { foreignKey: "DailyId" });

Daily.hasMany(PurchaseRequest);
PurchaseRequest.belongsTo(Daily, { foreignKey: "DailyId" });

Daily.hasMany(Discharges);
Discharges.belongsTo(Daily, { foreignKey: "DailyId" });
//---------------------------------------------

// Safe relations ------------------------------
Safe.belongsToMany(Daily, {
  through: SafeDailies,
  foreignKey: "SafeId",
  otherKey: "DailyId",
  as: "dailys",
});
Daily.belongsToMany(Safe, {
  through: SafeDailies,
  foreignKey: "DailyId",
  otherKey: "SafeId",
  as: "safes",
});

Safe.hasMany(SafeTransfers, { foreignKey: "SafeId", as: "safeTransfers" });
SafeTransfers.belongsTo(Safe, { foreignKey: "SafeId", as: "safe" });

// BusinessLocation relations -------------------
const businessLocationModels = [
  Admin,
  Client,
  Spieces,
  Category,
  Bill,
  BillTrans,
  Transfer,
  Store,
  SpiceStore,
  PurchaseRequest,
  Employee,
  EmpTrans,
  Discharges,
  Daily,
  Safe,
  SafeDailies,
  SafeTransfers,
];

businessLocationModels.forEach((Model) => {
  BusinessLocation.hasMany(Model, {
    foreignKey: "business_location",
    sourceKey: "name",
  });
  Model.belongsTo(BusinessLocation, {
    foreignKey: "business_location",
    targetKey: "name",
  });
});
//-----------------------END OF RELATIONS --------------------------------

// //add to db models
db.models.Admin = Admin;
db.models.BusinessLocation = BusinessLocation;
db.models.Client = Client;
db.models.Spieces = Spieces;
db.models.Category = Category;
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
