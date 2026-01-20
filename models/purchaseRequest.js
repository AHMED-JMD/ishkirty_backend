module.exports = (sequelize, DataTypes) => {
  const PurchaseRequest = sequelize.define(
    "PurchaseRequest",
    {
      vendor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      net_quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      buy_price: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    },
    { freezeTableName: true },
  );

  return PurchaseRequest;
};
