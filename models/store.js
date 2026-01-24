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
      warn_value: {
        // use DOUBLE to support fractional quantities (e.g., grams)
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      price: {
        // total price or selling price for the stock item
        type: DataTypes.BIGINT,
        defaultValue: 0,
      },
      isKilo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      business_location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "port sudan",
      },
    },
    { freezeTableName: true },
  );

  return Store;
};
