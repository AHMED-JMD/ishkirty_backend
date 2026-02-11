module.exports = (sequelize, DataTypes) => {
  const BusinessLocation = sequelize.define(
    "BusinessLocation",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    { freezeTableName: true },
  );

  return BusinessLocation;
};
