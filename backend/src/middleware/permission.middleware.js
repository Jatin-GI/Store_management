const { ROLE_PERMISSIONS } = require("../config/permissions");
const ROLES = require("../config/roles");
const { User, Role, Permissions } = require("../models");

const permission =
  (...permissions) =>
  async (req, res, next) => {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["name"],
          },
          {
            model: Permissions,
            as: "permission",
            attributes: ["name"],
            through: { attributes: [] },
          },
        ],
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      let userPermissions = [];
      if (user.role.name === ROLES.PRODUCT_LISTER) {
        userPermissions = (user.permission || []).map((p) => p.name);
        // Fallback to role template if no custom perms assigned
        if (userPermissions.length === 0) {
          userPermissions = ROLE_PERMISSIONS[ROLES.PRODUCT_LISTER] || [];
        }
      } else {
        userPermissions = ROLE_PERMISSIONS[user.role.name] || [];
      }

      const allowed = permissions.every((p) => userPermissions.includes(p));
      if (!allowed) {
        return res.status(403).json({ message: "Access denied" });
      }

      req.user.role = user.role.name;
      req.user.permissions = userPermissions;
      next();
    } catch (error) {
      return res.status(500).json({
        message: "Permission check failed",
        error: error.message,
      });
    }
  };

module.exports = permission;
