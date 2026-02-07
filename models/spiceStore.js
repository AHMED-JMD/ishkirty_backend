module.exports = (sequelize, DataTypes) => {
  const SpiceStore = sequelize.define(
    "SpiceStore",
    {
      // quantityNeeded is the amount of the store item required per single unit of the spice
      // e.g., 0.2 for 200 grams if store quantity unit is kg, or 200 if store quantity unit is grams
      quantityNeeded: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      store_type: {
        type: DataTypes.ENUM("بيع", "تصنيع"),
        allowNull: false,
        defaultValue: "بيع",
      },
      business_location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "port sudan",
      },
    },
    { freezeTableName: true },
  );

  return SpiceStore;
};
