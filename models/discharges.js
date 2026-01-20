module.exports = (sequelize, DataTypes) => {
  const Discharges = sequelize.define(
    "Discharges",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DOUBLE,
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

  return Discharges;
};
