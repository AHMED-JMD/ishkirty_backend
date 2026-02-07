module.exports = (sequelize, DataTypes) => {
  const Discharges = sequelize.define(
    "Discharges",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      isMonthly: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      admin: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
      },
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
    { freezeTableName: true },
  );

  return Discharges;
};
