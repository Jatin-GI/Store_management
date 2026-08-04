const express = require("express");
const auth = require("../middleware/auth.middleware");
const permission = require("../middleware/permission.middleware");
const { PERMISSIONS } = require("../config/permissions");
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require("../controller/order.controller");

const orderRoutes = express.Router();

orderRoutes.post(
  "/create",
  auth,
  permission(PERMISSIONS.ORDER_CREATE),
  createOrder,
);

orderRoutes.get(
  "/my-orders",
  auth,
  permission(PERMISSIONS.ORDER_READ),
  getMyOrders,
);

orderRoutes.get(
  "/all",
  auth,
  permission(PERMISSIONS.ORDER_UPDATE),
  getAllOrders,
);

orderRoutes.put(
  "/status/:id",
  auth,
  permission(PERMISSIONS.ORDER_UPDATE),
  updateOrderStatus,
);

orderRoutes.put(
  "/cancel/:id",
  auth,
  permission(PERMISSIONS.ORDER_CANCEL),
  cancelOrder,
);

module.exports = orderRoutes;
