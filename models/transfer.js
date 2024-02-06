module.exports = (sequelize, DataTypes) => {
  let transfer = sequelize.define(
    "transfer",
    {
      date: DataTypes.DATEONLY,
      amount: DataTypes.BIGINT,
    },
    { freezeTableName: true }
  );

  return transfer;
};
