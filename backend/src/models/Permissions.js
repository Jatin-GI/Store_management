const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Permissions = sequelize.define(
  "Permissions",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "permissions",
  },
);

module.exports = Permissions;
