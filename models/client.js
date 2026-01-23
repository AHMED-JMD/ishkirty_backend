module.exports = (sequelize, DataTypes) => {
  let client = sequelize.define(
    "Client",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phoneNum: DataTypes.BIGINT,
      account: { type: DataTypes.BIGINT, defaultValue: 0 },
      business_location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "port sudan",
      },
    },
    { freezeTableName: true },
  );

  return client;
};
