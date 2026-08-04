const express = require("express");
const auth = require("../middleware/auth.middleware");
const permission = require("../middleware/permission.middleware");
const { upload } = require("../config/cloudinaryConfig");
const { PERMISSIONS } = require("../config/permissions");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controller/Product.Controller");

const productRoutes = express.Router();

productRoutes.get(
  "/get-products",
  auth,
  permission(PERMISSIONS.PRODUCT_READ),
  getProducts,
);

productRoutes.get(
  "/get-product/:id",
  auth,
  permission(PERMISSIONS.PRODUCT_READ),
  getProductById,
);

productRoutes.post(
  "/create-product",
  auth,
  permission(PERMISSIONS.PRODUCT_CREATE),
  upload.array("image", 5),
  createProduct,
);

productRoutes.put(
  "/update-product/:id",
  auth,
  permission(PERMISSIONS.PRODUCT_UPDATE),
  updateProduct,
);

productRoutes.delete(
  "/delete-product/:id",
  auth,
  permission(PERMISSIONS.PRODUCT_DELETE),
  deleteProduct,
);

module.exports = productRoutes;
