module.exports = (sequelize, DataTypes) => {
  let spiecies = sequelize.define(
    "Spieces",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
    },
    { freezeTableName: true }
  );
  return spiecies;
};
