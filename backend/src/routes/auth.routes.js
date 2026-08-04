const express = require("express");
const { login, getUser } = require("../controller/auth.controller");
const auth = require("../middleware/auth.middleware");
const permission = require("../middleware/permission.middleware");
const { PERMISSIONS } = require("../config/permissions");

const authRoutes = express.Router();

authRoutes.post("/login", login);
authRoutes.get("/get-me", auth, permission(PERMISSIONS.PROFILE_READ), getUser);

module.exports = { authRoutes };
