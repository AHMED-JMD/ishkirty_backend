module.exports = (sequelize, DataTypes) => {
  const Employee = sequelize.define(
    "Employee",
    {
      name: { type: DataTypes.STRING, allowNull: false },
      jobTitle: { type: DataTypes.STRING },
      shift: { type: DataTypes.STRING },
      fixed_salary: { type: DataTypes.FLOAT, defaultValue: 0 },
      salary: { type: DataTypes.FLOAT, defaultValue: 0 },
      business_location: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "port sudan",
      },
    },
    {},
  );

  return Employee;
};
