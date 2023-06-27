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
// let Employee = require("./employee")(sequelize, Sequelize.DataTypes);
// let Deduct = require("./discount")(sequelize, Sequelize.DataTypes);
// let Checkout = require("./salariesCheck")(sequelize, Sequelize.DataTypes);
// let Grants = require("./grants")(sequelize, Sequelize.DataTypes);
// let Absent = require("./absentTable")(sequelize, Sequelize.DataTypes);

//sql relationship here -------------------------------
//checkout and employee
// Employee.hasMany(Checkout);
// Checkout.belongsTo(Employee);

// //deduct & employee
// Employee.hasMany(Deduct);
// Deduct.belongsTo(Employee);

// //grant & employee
// Employee.hasOne(Grants);
// Grants.belongsTo(Employee);
// //-----------------------------------------------------

// //add to db models
db.models.Admin = Admin;
// db.models.Employee = Employee;
// db.models.Deduct = Deduct;
// db.models.Checkout = Checkout;
// db.models.Grants = Grants;
// db.models.Absent = Absent;

module.exports = db;
