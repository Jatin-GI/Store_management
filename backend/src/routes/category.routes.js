const express = require("express");
const auth = require("../middleware/auth.middleware");
const permission = require("../middleware/permission.middleware");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controller/category.controller");
const { PERMISSIONS } = require("../config/permissions");
const { upload } = require("../config/cloudinaryConfig");

const categoryRoutes = express.Router();

categoryRoutes.get(
  "/get-categories",
  auth,
  permission(PERMISSIONS.CATEGORY_READ),
  getCategories,
);

categoryRoutes.post(
  "/create-category",
  auth,
  permission(PERMISSIONS.CATEGORY_CREATE),
  upload.single("image"),
  createCategory,
);

categoryRoutes.put(
  "/update-category/:id",
  auth,
  permission(PERMISSIONS.CATEGORY_UPDATE),
  upload.single("image"),
  updateCategory,
);

categoryRoutes.delete(
  "/delete-category/:id",
  auth,
  permission(PERMISSIONS.CATEGORY_DELETE),
  deleteCategory,
);

module.exports = categoryRoutes;
