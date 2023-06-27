module.exports = (sequelize, DataTypes) => {
  let Admin = sequelize.define(
    "admin",
    {
      admin_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV1,
      },
      username: DataTypes.STRING,
      phoneNum: DataTypes.INTEGER,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    { freezeTableName: true }
  );

  return Admin;
};
