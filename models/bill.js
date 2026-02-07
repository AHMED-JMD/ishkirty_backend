module.exports = (sequelize, DataTypes) => {
  let bill = sequelize.define(
    "Bill",
    {
      bill_counter: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
      amount: { type: DataTypes.BIGINT, allowNull: false },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.ENUM("بنكك", "كاش", "حساب", "فوري"),
        allowNull: true,
      },
      paymentMethods: {
        // when multiple payment parts are used, store as [{ method: 'كاش', amount: 100 }, ...]
        type: DataTypes.JSON,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM("محلي", "سفري", "استلام", "توصيل"),
        allowNull: false,
        defaultValue: "سفري",
      },
      isDelivery: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      delivery_cost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      delivery_address: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      shiftTime: {
        type: DataTypes.ENUM("صباحية", "مسائية", "كاملة"),
        allowNull: false,
      },
      admin: {
        type: DataTypes.STRING,
      },
      comment: {
        type: DataTypes.STRING,
        allowNull: false,
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
  return bill;
};
