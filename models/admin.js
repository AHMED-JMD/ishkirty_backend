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
      phoneNum: DataTypes.BIGINT,
      password: DataTypes.STRING,
      role: {
        type: DataTypes.STRING,
        defaultValue: "manager",
      },
      shift: {
        type: DataTypes.ENUM("صباحية", "مسائية", "كامل"),
        defaultValue: "كامل",
      },
    },
    { freezeTableName: true }
  );

  return Admin;
};
