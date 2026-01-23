module.exports = (sequelize, DataTypes) => {
  const SafeDailies = sequelize.define("SafeDailies", {
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
    total_dept: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    SafeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, { freezeTableName: true });
  return SafeDailies;
};
