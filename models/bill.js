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
    },
    { freezeTablaName: true }
  );
  return bill;
};
