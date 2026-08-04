import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectPermissions,
  selectRole,
} from "../store/authSlice";

export const PrivateRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const PermissionRoute = ({ permissions = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userPermissions = useSelector(selectPermissions);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const allowed = permissions.every((p) => userPermissions.includes(p));
  if (!allowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

// Allow only specific roles (e.g. customer shop pages)
export const RoleRoute = ({ roles = [] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectRole);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
