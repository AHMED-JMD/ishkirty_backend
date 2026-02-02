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
        defaultValue: "",
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ImgLink: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      spice_cost: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      isFavourites: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isControll: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      favBtn: {
        type: DataTypes.STRING,
        defaultValue: "",
      },
      business_location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "port sudan",
      },
    },
    { freezeTableName: true },
  );
  return spiecies;
};
