const { User, Role, Permissions } = require("../models");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const ROLES = require("../config/roles");

const getUserPermissions = async (user) => {
  if (user.role.name === ROLES.PRODUCT_LISTER) {
    const userPerms = await user.getPermission({
      attributes: ["name"],
      joinTableAttributes: [],
    });
    const names = userPerms.map((p) => p.name);
    // If admin has not assigned custom perms yet, fall back to role template
    if (names.length > 0) return names;
  }

  return (user.role.permission || []).map((p) => p.name);
};

const formatUser = async (user) => {
  const permissions = await getUserPermissions(user);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: {
      id: user.role.id,
      name: user.role.name,
      permissions,
    },
  };
};

const userInclude = [
  {
    model: Role,
    as: "role",
    attributes: ["id", "name"],
    include: [
      {
        model: Permissions,
        as: "permission",
        attributes: ["id", "name"],
        through: { attributes: [] },
      },
    ],
  },
];

const signup = async (req, res) => {
  try {
    const { name, email, password, role_id } = req.body;
    if (!email || !password || !name || !role_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exist = await User.findOne({ where: { email } });
    if (exist) {
      return res.status(400).json({ message: "User already exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role_id,
    });

    return res.status(200).json({
      message: "user create succesfully",
      token: generateToken(user.email, user.id),
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.scope("withpassword").findOne({
      where: { email },
      include: userInclude,
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    const cleanData = await formatUser(user);

    return res.status(200).json({
      data: cleanData,
      token: generateToken(user.email, user.id),
      message: "user login succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: userInclude,
    });

    if (!user) {
      return res.status(400).json({ message: "user not Found" });
    }

    return res.status(200).json({
      data: await formatUser(user),
      message: "user get succesfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};

module.exports = { login, signup, getUser };
