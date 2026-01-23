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
      business_location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "port sudan",
      },
    },
    { freezeTableName: true },
  );

  return billTrans;
};
