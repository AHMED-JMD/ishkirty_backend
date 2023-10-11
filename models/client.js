module.exports = (sequelize, DataTypes) => {
  let client = sequelize.define(
    "Client",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNum: DataTypes.BOUBLE,
      account: DataTypes.DOUBLE,
    },
    { freezeTableName: true }
  );

  return client;
};
