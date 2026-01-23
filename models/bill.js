module.exports = (sequelize, DataTypes) => {
  let bill = sequelize.define(
    "Bill",
    {
      amount: { type: DataTypes.BIGINT, allowNull: false },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.ENUM("بنكك", "كاش", "حساب"),
        allowNull: false,
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
      shiftTime: { type: DataTypes.ENUM("صباحية", "مسائية"), allowNull: false },
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
    { freezeTablaName: true },
  );
  return bill;
};
