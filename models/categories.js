module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Categories",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
      },
    },
    { freezeTableName: true },
  );

  return Category;
};
