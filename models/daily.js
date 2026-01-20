module.exports = (sequelize, DataTypes) => {
  const Daily = sequelize.define(
    "Daily",
    {
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      today_sales: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
      today_costs: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
      },
    },
    { freezeTableName: true },
  );

  return Daily;
};
