import { usePermission } from "../hooks/usePermission";

// Conditionally render UI by permission
const Can = ({ permission, permissions = [], children, fallback = null }) => {
  const { can } = usePermission();
  const required = permission ? [permission, ...permissions] : permissions;

  if (!can(...required)) {
    return fallback;
  }

  return children;
};

export default Can;
