module.exports = (sequelize, DataTypes) => {
  let client = sequelize.define(
    "Client",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNum: DataTypes.DOUBLE,
      account: { type: DataTypes.DOUBLE, defaultValue: 0 },
      date: DataTypes.DATEONLY,
    },
    { freezeTableName: true }
  );

  return client;
};
