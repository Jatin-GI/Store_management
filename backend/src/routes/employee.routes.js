const express = require("express");
const {
  createEmployee,
  getEmployees,
  deleteEmployee,
  updateEmployeePermissions,
} = require("../controller/employee.controller");
const auth = require("../middleware/auth.middleware");
const permission = require("../middleware/permission.middleware");
const { PERMISSIONS } = require("../config/permissions");

const employeeRoutes = express.Router();

employeeRoutes.get(
  "/get-employees",
  auth,
  permission(PERMISSIONS.EMPLOYEE_MANAGE),
  getEmployees,
);

employeeRoutes.post(
  "/create",
  auth,
  permission(PERMISSIONS.EMPLOYEE_MANAGE),
  createEmployee,
);

employeeRoutes.put(
  "/update/:id",
  auth,
  permission(PERMISSIONS.EMPLOYEE_MANAGE),
  updateEmployeePermissions,
);

employeeRoutes.delete(
  "/delete/:id",
  auth,
  permission(PERMISSIONS.EMPLOYEE_MANAGE),
  deleteEmployee,
);

module.exports = { employeeRoutes };
