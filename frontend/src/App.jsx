import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import CustomerLayout from "./components/CustomerLayout";
import Layout from "./components/Layout";
import {
  PermissionRoute,
  PrivateRoute,
  RoleRoute,
} from "./components/ProtectedRoute";
import { PERMISSIONS, ROLES } from "./constants/permissions";
import Cart from "./pages/Cart";
import Categories from "./pages/Categories";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import HomeRedirect from "./pages/HomeRedirect";
import Login from "./pages/Login";
import MyOrders from "./pages/MyOrders";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import Products from "./pages/Products";
import Shop from "./pages/Shop";
import Unauthorized from "./pages/Unauthorized";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<HomeRedirect />} />

          <Route
            element={
              <RoleRoute roles={[ROLES.ADMIN, ROLES.PRODUCT_LISTER]} />
            }
          >
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />

              <Route
                element={
                  <PermissionRoute
                    permissions={[PERMISSIONS.EMPLOYEE_MANAGE]}
                  />
                }
              >
                <Route path="/employees" element={<Employees />} />
              </Route>

              <Route
                element={
                  <PermissionRoute permissions={[PERMISSIONS.CATEGORY_READ]} />
                }
              >
                <Route path="/categories" element={<Categories />} />
              </Route>

              <Route
                element={
                  <PermissionRoute permissions={[PERMISSIONS.PRODUCT_READ]} />
                }
              >
                <Route path="/products" element={<Products />} />
              </Route>

              <Route
                element={
                  <PermissionRoute permissions={[PERMISSIONS.ORDER_UPDATE]} />
                }
              >
                <Route path="/orders" element={<Orders />} />
              </Route>
            </Route>
          </Route>

          <Route element={<RoleRoute roles={[ROLES.CUSTOMER]} />}>
            <Route element={<CustomerLayout />}>
              <Route path="/shop" element={<Shop />} />
              <Route path="/shop/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/my-orders" element={<MyOrders />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
