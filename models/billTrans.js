module.exports = (sequelize, DataTypes) => {
  let billTrans = sequelize.define(
    "BillTrans",
    {
      name: DataTypes.STRING,
      price: DataTypes.DOUBLE,
      quantity: DataTypes.DOUBLE,
      amount: DataTypes.DOUBLE,
    },
    { freezeTableName: true }
  );

  return billTrans;
};
