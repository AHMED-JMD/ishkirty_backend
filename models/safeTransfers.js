module.exports = (sequelize, DataTypes) => {
  const SafeTransfers = sequelize.define(
    "SafeTransfers",
    {
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      from: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      to: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      clientId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      SafeId: {
        type: DataTypes.INTEGER,
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
  return SafeTransfers;
};
