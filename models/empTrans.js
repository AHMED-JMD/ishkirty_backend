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
    },
    {},
  );

  return EmpTrans;
};
