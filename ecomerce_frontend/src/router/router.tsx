import { createBrowserRouter, Navigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import AdminLayout from "../components/AdminLayout";
import HomePage from "../pages/user/HomePage";
import ProductsPage from "../pages/user/ProductsPage";
import ProductDetailPage from "../pages/user/ProductDetailPage";
import CartPage from "../pages/user/CartPage";
import UserProfilePage from "../pages/user/UserProfilePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage";
import AdminProductsPage from "../pages/admin/AdminProductsPage";
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
                path: "/profile",
                element:
                    <ProtectedRoute role="CUSTOMER">
                        <UserProfilePage />
                    </ProtectedRoute>
            },
        ],
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
            { path: "categories", element: <AdminCategoriesPage /> },
            { path: "products", element: <AdminProductsPage /> },
        ],
    },

    // Điều hướng khi không tìm thấy trang
    {
        path: "*",
        element: <Navigate to="/" replace />,
    },
]);
