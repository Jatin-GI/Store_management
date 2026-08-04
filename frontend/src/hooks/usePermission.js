import { useSelector } from "react-redux";
import { selectPermissions, selectRole } from "../store/authSlice";

export const usePermission = () => {
  const permissions = useSelector(selectPermissions);
  const role = useSelector(selectRole);

  const can = (...required) =>
    required.every((permission) => permissions.includes(permission));

  const canAny = (...required) =>
    required.some((permission) => permissions.includes(permission));

  const isRole = (...roles) => roles.includes(role);

  return { can, canAny, isRole, permissions, role };
};
