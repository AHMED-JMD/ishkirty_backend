module.exports = (sequelize, DataTypes) => {
  let transfer = sequelize.define(
    "transfer",
    {
      date: DataTypes.DATEONLY,
      amount: DataTypes.BIGINT,
      business_location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "port sudan",
      },
    },
    { freezeTableName: true },
  );

  return transfer;
};
