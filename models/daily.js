module.exports = (sequelize, DataTypes) => {
  const Daily = sequelize.define(
    "Daily",
    {
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      cash_sales: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      bank_sales: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      account_sales: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      spices_costs: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      cash_costs: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      bank_costs: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      account_costs: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      isAddedtoSafe: {
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

  return Daily;
};
