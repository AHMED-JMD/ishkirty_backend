module.exports = (sequelize, DataTypes) => {
  let billTrans = sequelize.define(
    "BillTrans",
    {
      name: DataTypes.STRING,
      price: DataTypes.BIGINT,
      quantity: DataTypes.BIGINT,
      amount: DataTypes.BIGINT,
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    { freezeTableName: true }
  );

  return billTrans;
};
