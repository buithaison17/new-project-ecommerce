import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import AdminLayout from "../components/AdminLayout";
import HomePage from "../pages/user/HomePage";
import ProductsPage from "../pages/user/ProductsPage";
import ProductDetailPage from "../pages/user/ProductDetailPage";
import RegisterPage from "../pages/user/RegisterPage";
import LoginPage from "../pages/user/LoginPage";
import CartPage from "../pages/user/CartPage";
import CheckoutPage from "../pages/user/CheckoutPage";
import CheckoutSuccessPage from "../pages/user/CheckoutSuccessPage";
import UserProfilePage from "../pages/user/UserProfilePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminOrdersPage from "../pages/admin/AdminOrdersPage";
import AdminInventoryPage from "../pages/admin/AdminInventoryPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import OrdersPage from "../pages/user/OrdersPage";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
    // Các trang dành cho khách hàng
    {
        element: <AppLayout />,
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/products", element: <ProductsPage /> },
            { path: "/products/:id", element: <ProductDetailPage /> },
            { path: "/cart", element: <CartPage /> },
            {
                path: "/checkout",
                element:
                    <ProtectedRoute role="CUSTOMER">
                        <CheckoutPage />
                    </ProtectedRoute>
            },
            {
                path: "/checkout/success",
                element:
                    <ProtectedRoute role="CUSTOMER">
                        <CheckoutSuccessPage />
                    </ProtectedRoute>,
            },
            {
                path: "/orders",
                element:
                    <ProtectedRoute role="CUSTOMER">
                        <OrdersPage />
                    </ProtectedRoute>
            },
            {
                path: "/profile",
                element:
                    <ProtectedRoute role="CUSTOMER">
                        <UserProfilePage />
                    </ProtectedRoute>
            },
        ],
    },

    // Đăng nhập và đăng ký
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/register",
        element: <RegisterPage />,
    },

    // Các trang quản trị: chỉ ADMIN được truy cập
    {
        path: "/admin",
        element: (
            <ProtectedRoute role="ADMIN">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <AdminDashboardPage /> },
            { path: "orders", element: <AdminOrdersPage /> },
            { path: "categories", element: <AdminCategoriesPage /> },
            { path: "products", element: <AdminProductsPage /> },
            { path: "inventory", element: <AdminInventoryPage /> },
            { path: "users", element: <AdminUsersPage /> },
        ],
    },

    // Điều hướng khi không tìm thấy trang
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);
