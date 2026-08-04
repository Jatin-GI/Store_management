const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

/**
 * Universal variant — works for clothes, electronics, food, etc.
 *
 * attributes examples:
 *   Clothes:     { size: "M", color: "Red" }
 *   Electronics: { storage: "256GB", color: "Black", ram: "8GB" }
 *   Food:        { weight: "1kg", pack_type: "box" }
 *   Default:     {}  (single SKU product, no options)
 */
const Productvariant = sequelize.define(
  "ProductVariant",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    attributes: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "product_variant",
    timestamps: true,
  },
);

module.exports = Productvariant;
