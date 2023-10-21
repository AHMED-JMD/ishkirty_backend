module.exports = (sequelize, DataTypes) => {
  let bill = sequelize.define(
    "Bill",
    {
      bill_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaulValue: DataTypes.UUIDV1,
      },
      amount: { type: DataTypes.DOUBLE, allowNull: false },
      isDeleted: { type: DataTypes.BOOLEAN, defaulValue: false },
      paymentMethod: { type: DataTypes.STRING, allowNull: false },
      date: { type: DataTypes.DATEONLY, allowNull: false },
    },
    { freezeTablaName: true }
  );
  return bill;
};
