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
  }
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

//sql relationship here -------------------------------
Bill.hasMany(BillTrans);
BillTrans.belongsTo(Bill);
Spieces.hasMany(BillTrans);
Client.hasMany(Bill);
Admin.hasMany(Bill);
Admin.hasMany(Transfer);
// //-----------------------------------------------------

// //add to db models
db.models.Admin = Admin;
db.models.Client = Client;
db.models.Spieces = Spieces;
db.models.Bill = Bill;
db.models.BillTrans = BillTrans;
db.models.Transfer = Transfer;

module.exports = db;
