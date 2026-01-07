module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define(
    "Store",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        // use DOUBLE to support fractional quantities (e.g., grams)
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      sell_price: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      buy_price: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
    },
    { freezeTableName: true }
  );

  return Store;
};
