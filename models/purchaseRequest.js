module.exports = (sequelize, DataTypes) => {
  const PurchaseRequest = sequelize.define(
    "PurchaseRequest",
    {
      vendor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      net_quantity: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      type: {
        type: DataTypes.ENUM("بيع", "تصنيع"),
        allowNull: false,
      },
      buy_price: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      admin: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },

      payment_method: {
        type: DataTypes.ENUM("بنكك", "كاش", "حساب"),
        allowNull: false,
        defaultValue: "كاش",
      },
      business_location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "port sudan",
      },
    },
    { freezeTableName: true },
  );

  return PurchaseRequest;
};
