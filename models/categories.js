module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Categories",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "",
      },
      business_location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "port sudan",
      },
    },
    {
      freezeTableName: true,
      // indexes: [
      //   {
      //     unique: true,
      //     fields: ["name", "business_location"],
      //   },
      // ],
    },
  );

  return Category;
};
