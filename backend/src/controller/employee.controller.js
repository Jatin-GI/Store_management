const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const { User, Role, Permissions, sequelize } = require("../models");
const ROLES = require("../config/roles");

const createEmployee = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;

    if (!name || !email || !password || !permissions) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        message: "permissions must be a non-empty array",
      });
    }

    const exist = await User.findOne({ where: { email } });
    if (exist) {
      return res.status(400).json({ message: "User already exist" });
    }

    const listerRole = await Role.findOne({
      where: { name: ROLES.PRODUCT_LISTER },
    });

    if (!listerRole) {
      return res.status(400).json({ message: "Product lister role not found" });
    }

    const allowedPermissions = await listerRole.getPermission();
    const allowedNames = allowedPermissions.map((p) => p.name);

    const invalid = permissions.filter((p) => !allowedNames.includes(p));
    if (invalid.length > 0) {
      return res.status(400).json({
        message: "Invalid permissions for product_lister",
        invalid,
      });
    }

    const selectedPermissions = await Permissions.findAll({
      where: { name: { [Op.in]: permissions } },
    });

    const hashedPassword = await bcrypt.hash(password, 10);
    const t = await sequelize.transaction();

    try {
      const employee = await User.create(
        {
          name,
          email,
          password: hashedPassword,
          role_id: listerRole.id,
        },
        { transaction: t },
      );

      await employee.setPermission(selectedPermissions, { transaction: t });

      const savedPermissions = await employee.getPermission({
        attributes: ["id", "name"],
        joinTableAttributes: [],
        transaction: t,
      });

      await t.commit();

      return res.status(201).json({
        message: "Employee created successfully",
        data: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: {
            name: ROLES.PRODUCT_LISTER,
            id: employee.role_id,
          },
          permissions: savedPermissions.map((p) => p.name),
        },
      });
    } catch (error) {
      await t.rollback();
      throw error;
    }
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

const getEmployees = async (req, res) => {
  try {
    const listerRole = await Role.findOne({
      where: { name: ROLES.PRODUCT_LISTER },
    });

    if (!listerRole) {
      return res.status(200).json({ data: [], message: "No employees" });
    }

    const employees = await User.findAll({
      where: { role_id: listerRole.id },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
        {
          model: Permissions,
          as: "permission",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const data = employees.map((emp) => ({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role: emp.role,
      permissions: (emp.permission || []).map((p) => p.name),
      createdAt: emp.createdAt,
    }));

    return res.status(200).json({
      data,
      message: "Employees fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: "role" }],
    });

    if (!employee || employee.role.name !== ROLES.PRODUCT_LISTER) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await employee.destroy();

    return res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

const updateEmployeePermissions = async (req, res) => {
  try {
    const { permissions, name, email } = req.body;

    if (!Array.isArray(permissions) || permissions.length === 0) {
      return res.status(400).json({
        message: "permissions must be a non-empty array",
      });
    }

    const employee = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: "role" }],
    });

    if (!employee || employee.role.name !== ROLES.PRODUCT_LISTER) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const listerRole = await Role.findOne({
      where: { name: ROLES.PRODUCT_LISTER },
    });
    const allowedPermissions = await listerRole.getPermission();
    const allowedNames = allowedPermissions.map((p) => p.name);

    const invalid = permissions.filter((p) => !allowedNames.includes(p));
    if (invalid.length > 0) {
      return res.status(400).json({
        message: "Invalid permissions for product_lister",
        invalid,
      });
    }

    if (email && email !== employee.email) {
      const exist = await User.findOne({ where: { email } });
      if (exist) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const selectedPermissions = await Permissions.findAll({
      where: { name: { [Op.in]: permissions } },
    });

    const t = await sequelize.transaction();
    try {
      await employee.update(
        {
          name: name || employee.name,
          email: email || employee.email,
        },
        { transaction: t },
      );

      await employee.setPermission(selectedPermissions, { transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }

    const savedPermissions = await employee.getPermission({
      attributes: ["id", "name"],
      joinTableAttributes: [],
    });

    return res.status(200).json({
      message: "Employee updated successfully",
      data: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: {
          name: ROLES.PRODUCT_LISTER,
          id: employee.role_id,
        },
        permissions: savedPermissions.map((p) => p.name),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  deleteEmployee,
  updateEmployeePermissions,
};
