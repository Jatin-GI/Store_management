import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectRole } from "../store/authSlice";
import { ROLES } from "../constants/permissions";

// Sends each role to its own home page
const HomeRedirect = () => {
  const role = useSelector(selectRole);

  if (role === ROLES.CUSTOMER) {
    return <Navigate to="/shop" replace />;
  }

  if (role === ROLES.PRODUCT_LISTER) {
    return <Navigate to="/products" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default HomeRedirect;
