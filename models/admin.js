module.exports = (sequelize, DataTypes) => {
  let Admin = sequelize.define(
    "Admin",
    {
      admin_id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV1,
      },
      username: DataTypes.STRING,
      phoneNum: DataTypes.INTEGER,
      password: DataTypes.STRING,
    },
    { freezeTableName: true }
  );

  return Admin;
};
