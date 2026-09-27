import { createBrowserRouter, Navigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "../components/admin/ProtectedRoute";
import CartPage from "../pages/public/CartPage";
// Public Pages (Placeholder — سنبنيها في المرحلة 8)
import HomePage from "../pages/public/HomePage";
import NotFoundPage from "../pages/NotFoundPage";

// Admin Pages (Placeholder — سنبنيها في المرحلة 12)
import AdminLoginPage from "../pages/admin/LoginPage";
import AdminOrdersPage from "../pages/admin/OrdersPage";
import AdminCategoriesPage from "../pages/admin/CategoriesPage";
import AdminProductsPage from "../pages/admin/ProductsPage";
import AdminSettingsPage from "../pages/admin/SettingsPage";
import CheckoutPage from "../pages/public/CheckoutPage";
import OrderSuccessPage from "../pages/public/OrderSuccessPage";
import OrderStatusPage from "../pages/public/OrderStatusPage";

export const router = createBrowserRouter([
  // Public
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/order-success/:publicToken", element: <OrderSuccessPage /> },
      { path: "/order-status/:publicToken", element: <OrderStatusPage /> },
      // المسارات الأخرى في المرحلة 8
    ],
    
  },
  { path: "/cart", element: <CartPage /> },

  // Admin Login (بلا حماية)
  { path: "/admin/login", element: <AdminLoginPage /> },

  // Admin (محمي)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: "/admin", element: <Navigate to="/admin/orders" replace /> },
          { path: "/admin/orders", element: <AdminOrdersPage /> },
          { path: "/admin/categories", element: <AdminCategoriesPage /> },
          { path: "/admin/products", element: <AdminProductsPage /> },
          { path: "/admin/settings", element: <AdminSettingsPage /> },
        ],
      },
    ],
  },

  // 404
  { path: "*", element: <NotFoundPage /> },
]);
