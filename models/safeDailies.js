module.exports = (sequelize, DataTypes) => {
  const SafeDailies = sequelize.define(
    "SafeDailies",
    {
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      total_cash: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      total_bank: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      total_fawry: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      total_dept: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      SafeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      DailyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      business_location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "port sudan",
      },
    },
    { freezeTableName: true },
  );
  return SafeDailies;
};
