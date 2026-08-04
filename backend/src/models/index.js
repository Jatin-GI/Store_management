const sequelize = require("../config/db");
const Category = require("./Category");
const Permissions = require("./Permissions");
const Product = require("./Product");
const ProductImage = require("./ProductImage");
const Productvariant = require("./ProductVariant");
const Role = require("./Role");
const User = require("./User");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

User.belongsTo(Role, {
  foreignKey: "role_id",
  as: "role",
});

Role.hasMany(User, {
  foreignKey: "role_id",
  as: "user",
});

Permissions.belongsToMany(Role, {
  foreignKey: "permission_id",
  otherKey: "role_id",
  through: "role_permission",
  as: "role",
  onDelete: "CASCADE",
});

Role.belongsToMany(Permissions, {
  foreignKey: "role_id",
  otherKey: "permission_id",
  through: "role_permission",
  as: "permission",
  onDelete: "CASCADE",
});

User.belongsToMany(Permissions, {
  foreignKey: "user_id",
  otherKey: "permission_id",
  through: "user_permission",
  as: "permission",
  onDelete: "CASCADE",
});

Permissions.belongsToMany(User, {
  foreignKey: "permission_id",
  otherKey: "user_id",
  through: "user_permission",
  as: "user",
  onDelete: "CASCADE",
});

Category.hasMany(Product, {
  foreignKey: "category_id",
  as: "products",
  onDelete: "CASCADE",
});

Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

Product.hasMany(ProductImage, {
  foreignKey: "product_id",
  as: "images",
  onDelete: "CASCADE",
});

ProductImage.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

Product.hasMany(Productvariant, {
  foreignKey: "product_id",
  as: "variants",
  onDelete: "CASCADE",
});

Productvariant.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

User.hasMany(Order, {
  foreignKey: "user_id",
  as: "orders",
  onDelete: "CASCADE",
});

Order.belongsTo(User, {
  foreignKey: "user_id",
  as: "customer",
});

Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "items",
  onDelete: "CASCADE",
});

OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

OrderItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

OrderItem.belongsTo(Productvariant, {
  foreignKey: "variant_id",
  as: "variant",
});

module.exports = {
  sequelize,
  User,
  Role,
  Permissions,
  Category,
  Product,
  Productvariant,
  ProductImage,
  Order,
  OrderItem,
};
