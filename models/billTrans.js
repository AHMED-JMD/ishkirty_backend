module.exports = (sequelize, DataTypes) => {
  let billTrans = sequelize.define(
    "BillTrans",
    {
      quantity: DataTypes.DOUBLE,
      amount: DataTypes.DOUBLE,
    },
    { freezeTableName: true }
  );

  return billTrans;
};
