module.exports = (sequelize, DataTypes) => {
  const EmpTrans = sequelize.define(
    "EmpTrans",
    {
      type: {
        type: DataTypes.ENUM("اضافة", "خصم"),
        allowNull: false,
        defaultValue: "خصم",
      },
      amount: { type: DataTypes.FLOAT, allowNull: false },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      admin: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
      payment_method: {
        type: DataTypes.ENUM("بنكك", "كاش", "حساب", "فوري"),
        allowNull: false,
        defaultValue: "كاش",
      },
      business_location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "port sudan",
      },
    },
    {},
  );

  return EmpTrans;
};
