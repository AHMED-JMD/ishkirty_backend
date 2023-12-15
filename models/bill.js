module.exports = (sequelize, DataTypes) => {
  let bill = sequelize.define(
    "Bill",
    {
      bill_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV1,
      },
      amount: { type: DataTypes.BIGINT, allowNull: false },
      isDeleted: { type: DataTypes.BOOLEAN, defaulValue: false },
      paymentMethod: {
        type: DataTypes.ENUM("BANKK", "CASH", "ACCOUNT"),
        allowNull: false,
      },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      shiftTime: { type: DataTypes.ENUM("MORNING", "NIGHT"), allowNull: false },
    },
    { freezeTablaName: true }
  );
  return bill;
};
