module.exports = (sequelize, DataTypes) => {
  const Safe = sequelize.define("Safe", {
    bank_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    cash_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    dept_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    business_location: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "port sudan",
    },
  });
  return Safe;
};
